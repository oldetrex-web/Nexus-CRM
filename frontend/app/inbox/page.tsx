"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Paperclip,
  ArrowLeft,
  Bot,
  CheckCheck,
  Search,
  MoreVertical,
  Phone,
  Video,
  Plus,
  Zap,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  channel: string;
  phone?: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface ChatMsg {
  id: string;
  type: "inbound" | "outbound" | "ai";
  text: string;
  time: string;
}

export default function InboxPage() {
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New Dialog state
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newChannel, setNewChannel] = useState("whatsapp");
  const [newFirstMessage, setNewFirstMessage] = useState("");

  // Load all messages and contacts from Backend
  const loadConversationsFromBackend = async () => {
    setLoading(true);
    try {
      const [messagesRes, contactsRes] = await Promise.all([
        api.get("/messages").catch(() => ({ data: [] })),
        api.get("/contacts").catch(() => ({ data: [] })),
      ]);

      const allMessages = Array.isArray(messagesRes.data) ? messagesRes.data : [];
      const allContacts = Array.isArray(contactsRes.data) ? contactsRes.data : [];

      const convMap = new Map<string, Conversation>();

      // Group messages by contact_id or sender_external_id
      allMessages.forEach((m: any) => {
        const key = m.contact_id || m.sender_external_id || "general";
        const contactObj = allContacts.find((c: any) => c.id === key);
        const name = contactObj
          ? `${contactObj.first_name} ${contactObj.last_name || ""}`.trim()
          : m.sender_external_id || "Клиент";

        const timeStr = new Date(m.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (!convMap.has(key)) {
          convMap.set(key, {
            id: key,
            name,
            avatar: name.slice(0, 2).toUpperCase(),
            channel: m.channel || "whatsapp",
            lastMessage: m.text_content || "",
            time: timeStr,
            unread: m.direction === "inbound" ? 1 : 0,
          });
        }
      });

      // Also ensure any existing contacts are available in conversation list
      allContacts.forEach((c: any) => {
        if (!convMap.has(c.id)) {
          const name = `${c.first_name} ${c.last_name || ""}`.trim();
          convMap.set(c.id, {
            id: c.id,
            name,
            avatar: name.slice(0, 2).toUpperCase(),
            channel: c.whatsapp ? "whatsapp" : c.telegram ? "telegram" : "general",
            phone: c.phone,
            lastMessage: "Диалог открыт",
            time: "Недавно",
            unread: 0,
          });
        }
      });

      const convList = Array.from(convMap.values());
      setConversations(convList);

      if (convList.length > 0 && !activeChat) {
        setActiveChat(convList[0]);
      }
    } catch (err) {
      console.warn("Failed to load inbox data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversationsFromBackend();
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = async (chatId: string) => {
    try {
      const res = await api.get(`/messages?contact_id=${chatId}`);
      if (res.data && Array.isArray(res.data)) {
        const formatted: ChatMsg[] = res.data.map((m: any) => ({
          id: m.id,
          type: m.is_ai_generated ? "ai" : m.direction === "inbound" ? "inbound" : "outbound",
          text: m.text_content || "",
          time: new Date(m.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        // Sort ascending by time
        setMessages(formatted.reverse());
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  // Send message
  const handleSend = async (textToSend?: string, isAi: boolean = false) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeChat) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const localNewMsg: ChatMsg = {
      id: `m_${Date.now()}`,
      type: isAi ? "ai" : "outbound",
      text,
      time: timeNow,
    };

    setMessages((prev) => [...prev, localNewMsg]);
    if (!textToSend) setInputText("");

    try {
      await api.post("/messages", {
        channel: activeChat.channel,
        direction: "outbound",
        contact_id: activeChat.id,
        text_content: text,
        is_ai_generated: isAi,
      });
      // update conversation snippet
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeChat.id ? { ...c, lastMessage: text, time: timeNow } : c
        )
      );
    } catch (err) {
      console.error("Failed to send message to backend", err);
    }
  };

  // Simulate an inbound test message to test real message ingestion
  const handleSimulateInbound = async () => {
    const defaultContactId = activeChat?.id || "contact_lead_01";
    const inboundText = "Здравствуйте! Хочу уточнить стоимость и возможность выставления счета через Kaspi.";
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      await api.post("/messages", {
        channel: activeChat?.channel || "whatsapp",
        direction: "inbound",
        contact_id: defaultContactId,
        sender_external_id: "+7 (701) 555-12-34",
        text_content: inboundText,
        is_ai_generated: false,
      });

      const newMsg: ChatMsg = {
        id: `m_in_${Date.now()}`,
        type: "inbound",
        text: inboundText,
        time: timeNow,
      };

      setMessages((prev) => [...prev, newMsg]);
      await loadConversationsFromBackend();
    } catch (err) {
      console.error("Failed to simulate inbound message", err);
    }
  };

  // Create new conversation
  const handleCreateNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    try {
      // 1. Create Contact in backend
      const contactRes = await api.post("/contacts", {
        first_name: newClientName,
        phone: newClientPhone || "+7 (700) 000-00-00",
        whatsapp: newChannel === "whatsapp" ? newClientPhone : undefined,
        telegram: newChannel === "telegram" ? newClientPhone : undefined,
        status: "lead",
      });

      const createdContact = contactRes.data;

      // 2. If first message is present, send it
      if (newFirstMessage.trim()) {
        await api.post("/messages", {
          channel: newChannel,
          direction: "outbound",
          contact_id: createdContact.id,
          text_content: newFirstMessage,
        });
      }

      setNewChatDialogOpen(false);
      setNewClientName("");
      setNewClientPhone("");
      setNewFirstMessage("");

      await loadConversationsFromBackend();
      setActiveChat({
        id: createdContact.id,
        name: createdContact.first_name,
        avatar: createdContact.first_name.slice(0, 2).toUpperCase(),
        channel: newChannel,
        phone: createdContact.phone,
        lastMessage: newFirstMessage || "Диалог создан",
        time: "Только что",
        unread: 0,
      });
    } catch (err) {
      console.error("Failed to create new conversation", err);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesChannel = selectedChannel === "all" || c.channel === selectedChannel;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: Channels */}
        <div className="hidden lg:flex w-52 flex-col border-r border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/40 p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider px-3 py-2">
            Каналы связи
          </div>
          {[
            { id: "all", name: "Все каналы" },
            { id: "whatsapp", name: "WhatsApp" },
            { id: "telegram", name: "Telegram" },
            { id: "email", name: "Email" },
            { id: "webchat", name: "Веб-виджет" },
          ].map((ch) => {
            const isSelected = selectedChannel === ch.id;
            const count =
              ch.id === "all"
                ? conversations.length
                : conversations.filter((c) => c.channel === ch.id).length;

            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full",
                  isSelected
                    ? "bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-white/10 shadow-xs font-semibold"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60"
                )}
              >
                <span>{ch.name}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono",
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div className="pt-4 px-1 space-y-2">
            <Button
              onClick={() => setNewChatDialogOpen(true)}
              size="sm"
              className="w-full h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Новый диалог</span>
            </Button>
            <Button
              onClick={handleSimulateInbound}
              variant="outline"
              size="sm"
              className="w-full h-8 text-[11px] gap-1.5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300"
            >
              <Zap className="h-3 w-3 text-amber-500" />
              <span>Тестовый лид</span>
            </Button>
          </div>
        </div>

        {/* COLUMN 2: Conversations List */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-80 flex flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/60",
            mobileView === "chat" ? "hidden md:flex" : "flex"
          )}
        >
          <div className="p-3 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
              <Input
                placeholder="Поиск диалогов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-white/10 text-slate-900 dark:text-zinc-100"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadConversationsFromBackend}
              className="h-9 w-9 text-slate-500 dark:text-zinc-400 hover:text-slate-900 shrink-0"
              title="Обновить диалоги"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((c) => {
                const isSelected = activeChat?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveChat(c);
                      setMobileView("chat");
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3.5 cursor-pointer transition-colors relative",
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/20 border-l-3 border-blue-600"
                        : "hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                    )}
                  >
                    <Avatar className="h-9 w-9 shrink-0 ring-1 ring-slate-200 dark:ring-white/10">
                      <AvatarFallback className="text-xs bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-zinc-200 font-semibold">
                        {c.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 font-mono">
                          {c.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {c.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant="outline"
                          className="text-[9px] py-0 px-1.5 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/5 uppercase"
                        >
                          {c.channel}
                        </Badge>
                        {c.unread > 0 && (
                          <span className="ml-auto h-4 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                  Нет активных диалогов
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                  База сообщений пуста. Начните первый диалог или создайте тестовое обращение.
                </p>
                <Button
                  onClick={() => setNewChatDialogOpen(true)}
                  size="sm"
                  className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-3 w-3" />
                  <span>Начать диалог</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: Active Chat Window */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-slate-50/50 dark:bg-zinc-950",
            mobileView === "list" ? "hidden md:flex" : "flex"
          )}
        >
          {activeChat ? (
            <>
              {/* Header */}
              <div className="h-14 px-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileView("list")}
                    className="md:hidden h-8 w-8 text-slate-500 dark:text-zinc-400"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8 ring-1 ring-slate-200 dark:ring-white/10">
                    <AvatarFallback className="text-xs bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-zinc-200 font-bold">
                      {activeChat.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {activeChat.name}
                    </h3>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Синхронизировано ({activeChat.channel})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSimulateInbound}
                    className="h-8 w-8 text-slate-500 dark:text-zinc-400 hover:text-blue-600"
                    title="Смоделировать входящее сообщение"
                  >
                    <Zap className="h-4 w-4 text-amber-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-zinc-400">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-zinc-400">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%] sm:max-w-[70%]",
                        msg.type === "inbound" ? "mr-auto items-start" : "ml-auto items-end"
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-xl text-xs sm:text-sm leading-relaxed",
                          msg.type === "inbound" &&
                            "bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-white/10 rounded-tl-xs shadow-xs",
                          msg.type === "outbound" &&
                            "bg-blue-600 text-white font-medium rounded-tr-xs shadow-xs",
                          msg.type === "ai" &&
                            "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-tr-xs shadow-xs"
                        )}
                      >
                        {msg.type === "ai" && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 uppercase mb-1">
                            <Bot className="h-3 w-3" /> AI Sales Assistant
                          </div>
                        )}
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 px-1 flex items-center gap-1 font-mono">
                        {msg.time}
                        {msg.type !== "inbound" && (
                          <CheckCheck className="h-3 w-3 text-blue-500 dark:text-indigo-400" />
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400 dark:text-zinc-500">
                    <MessageSquare className="h-8 w-8 text-slate-300 dark:text-zinc-700" />
                    <p className="text-xs">Диалог пуст. Напишите первое сообщение клиенту.</p>
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-slate-500 dark:text-zinc-400 hover:text-slate-900 shrink-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Напишите сообщение клиенту..."
                  className="flex-1 h-9 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400"
                />
                <Button
                  onClick={() => handleSend()}
                  className="h-9 px-3.5 gap-1.5 text-xs shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Отправить</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 text-slate-500 dark:text-zinc-400">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-blue-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Единый центр диалогов
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                Выберите диалог из списка слева или начните новую переписку с клиентом.
              </p>
              <Button
                onClick={() => setNewChatDialogOpen(true)}
                size="sm"
                className="gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Начать новый диалог</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* DIALOG: NEW CONVERSATION */}
      <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-zinc-100 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-zinc-100">Начать новый диалог</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Создание нового контакта и отправка первого сообщения через подключенный канал
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNewChat} className="space-y-3 mt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">Имя клиента *</label>
              <Input
                required
                placeholder="Арман Сериков"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">Телефон</label>
                <Input
                  placeholder="+7 (701) 123-45-67"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">Канал связи</label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-100"
                >
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="telegram">Telegram Bot</option>
                  <option value="email">Email</option>
                  <option value="webchat">Веб-чат</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">Первое сообщение</label>
              <Input
                placeholder="Здравствуйте! Вы интересовались нашими услугами..."
                value={newFirstMessage}
                onChange={(e) => setNewFirstMessage(e.target.value)}
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setNewChatDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Создать диалог
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
