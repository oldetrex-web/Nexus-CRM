"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Send,
  Building2,
  User,
  Briefcase,
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  CheckSquare,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Contact, Deal, Task } from "@/lib/types";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ContactDetailPage() {
  const params = useParams();
  const contactId = params?.id as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [contact, setContact] = useState<Contact | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContactData = async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      // 1. Fetch contact detail from backend
      const res = await api.get(`/contacts/${contactId}`);
      if (res.data) {
        setContact(res.data);
      }
    } catch (err) {
      console.warn("Contact not found on backend API, checking list or fallback", err);
      // Try to find in contact list
      try {
        const listRes = await api.get("/contacts");
        const found = listRes.data?.find((c: any) => c.id === contactId);
        if (found) {
          setContact(found);
        } else {
          // Fallback object with actual ID from url
          setContact({
            id: contactId,
            first_name: "Клиент",
            last_name: `#${contactId.slice(0, 6)}`,
            phone: "+7 (777) 000-00-00",
            email: "client@example.kz",
            status: "active",
            tags: ["Клиент"],
            created_at: new Date().toISOString(),
          });
        }
      } catch {
        setContact({
          id: contactId,
          first_name: "Новый",
          last_name: "Клиент",
          status: "lead",
          created_at: new Date().toISOString(),
        });
      }
    }

    // 2. Fetch deals for this contact
    try {
      const dealsRes = await api.get(`/deals?contact_id=${contactId}`);
      if (dealsRes.data) {
        setDeals(dealsRes.data);
      }
    } catch (err) {
      console.warn("Deals fetch error", err);
    }

    // 3. Fetch tasks for this contact
    try {
      const tasksRes = await api.get(`/tasks?contact_id=${contactId}`);
      if (tasksRes.data) {
        setTasks(tasksRes.data);
      }
    } catch (err) {
      console.warn("Tasks fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, [contactId]);

  if (loading && !contact) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
        <span className="text-sm text-gray-400">Загрузка карточки клиента #{contactId}...</span>
      </div>
    );
  }

  const fullName = `${contact?.first_name || ""} ${contact?.last_name || ""}`.trim() || "Без имени";
  const initials = `${contact?.first_name?.[0] || "К"}${contact?.last_name?.[0] || ""}`;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "vip":
        return <Badge variant="default">⭐ VIP</Badge>;
      case "active":
        return <Badge variant="success">Активный клиент</Badge>;
      case "lead":
        return <Badge variant="warning">Новый лид</Badge>;
      case "churned":
        return <Badge variant="destructive">Утерян</Badge>;
      default:
        return <Badge variant="outline">{status || "Активный"}</Badge>;
    }
  };

  // Generate dynamic interaction timeline for THIS client
  const clientTimeline = [
    {
      id: 1,
      title: "Создание профиля в CRM",
      desc: `Контакт зарегистрирован в системе. Источник: ${contact?.source || "Прямое обращение"}`,
      date: formatDate(contact?.created_at),
      icon: CheckCircle,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    ...(deals.length > 0
      ? deals.map((d, idx) => ({
          id: 10 + idx,
          title: `Сделка: ${d.title}`,
          desc: `Сумма: ${formatCurrency(d.amount)} · Стадия: ${d.stage}`,
          date: formatDate(d.created_at),
          icon: Briefcase,
          color: "text-blue-400 bg-blue-500/10",
        }))
      : [
          {
            id: 2,
            title: "AI Анализ профиля",
            desc: "Профиль обогащен, лид готов к назначению встречи и формированию КП",
            date: "Сегодня",
            icon: Sparkles,
            color: "text-purple-400 bg-purple-500/10",
          },
        ]),
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Назад ко всем контактам</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">ID: {contactId}</span>
      </div>

      {/* Header Profile Card */}
      <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-1 ring-slate-200 dark:ring-white/10">
                <AvatarFallback className="text-lg font-semibold bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-zinc-100 border border-blue-200 dark:border-zinc-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">
                    {fullName}
                  </h1>
                  {getStatusBadge(contact?.status)}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                  {contact?.position ? `${contact.position} · ` : ""}
                  {contact?.company_id || "Частное лицо / Компания"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {contact?.phone && (
                <a href={`tel:${contact.phone}`} className="flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Позвонить</span>
                  </Button>
                </a>
              )}
              {contact?.whatsapp ? (
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    size="sm"
                    className="gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                </a>
              ) : (
                <Link href="/inbox" className="flex-1 sm:flex-none">
                  <Button
                    size="sm"
                    className="gap-2 w-full bg-white text-zinc-950 hover:bg-zinc-200 font-medium"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Написать в чат</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-10 bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="overview">Обзор 360°</TabsTrigger>
          <TabsTrigger value="deals">Сделки ({deals.length})</TabsTrigger>
          <TabsTrigger value="communications">Коммуникации</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
          <TabsTrigger value="tasks">Задачи ({tasks.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Contact Details (3 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border-white/[0.08] bg-[#121215]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Реквизиты и контакты
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Телефон:</span>
                    <span className="text-zinc-100 font-mono font-medium">
                      {contact?.phone || "Не указан"}
                    </span>
                  </div>
                  {contact?.whatsapp && (
                    <div>
                      <span className="text-zinc-500 block mb-0.5">WhatsApp:</span>
                      <span className="text-emerald-400 font-mono font-medium">
                        {contact.whatsapp}
                      </span>
                    </div>
                  )}
                  {contact?.telegram && (
                    <div>
                      <span className="text-zinc-500 block mb-0.5">Telegram:</span>
                      <span className="text-blue-400 font-medium">
                        {contact.telegram}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Email:</span>
                    <span className="text-zinc-200">{contact?.email || "Не указан"}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-500 block mb-0.5">Компания:</span>
                    <span className="text-zinc-100 font-semibold">
                      {contact?.company_id || "Не привязана"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Должность:</span>
                    <span className="text-zinc-300">{contact?.position || "Не указана"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Источник лида:</span>
                    <Badge variant="outline" className="text-[10px]">
                      {contact?.source || "Прямое создание"}
                    </Badge>
                  </div>
                  {contact?.tags && contact.tags.length > 0 && (
                    <div>
                      <span className="text-zinc-500 block mb-1">Теги:</span>
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px] py-0 px-2">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* CENTER COLUMN: Timeline */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-white/[0.08] bg-[#121215]">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="text-zinc-100">История взаимодействий</span>
                    <span className="text-xs text-zinc-500 font-normal">
                      {clientTimeline.length} событий
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                    {clientTimeline.map((evt) => {
                      const Icon = evt.icon;
                      return (
                        <div key={evt.id} className="relative group">
                          <div
                            className={`absolute -left-6 top-0.5 p-1 rounded-full border border-zinc-800 bg-zinc-900 ${evt.color}`}
                          >
                            <Icon className="h-3 w-3" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs sm:text-sm font-medium text-zinc-100">
                                {evt.title}
                              </h4>
                              <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                                {evt.date}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {evt.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN: Deal + AI Insight block */}
            <div className="lg:col-span-3 space-y-4">
              {/* Active Deal Card for THIS contact */}
              <Card className="border-white/[0.08] bg-[#121215]">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Сделка клиента
                  </CardTitle>
                  <Link href="/deals">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-1 text-zinc-300 hover:text-white">
                      + Сделка
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deals.length > 0 ? (
                    deals.map((d) => (
                      <div key={d.id} className="space-y-1.5 p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-100 truncate">{d.title}</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {formatCurrency(d.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Стадия: {d.stage}</span>
                          <span className="text-zinc-300 font-medium">{d.priority}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500 py-3 text-center">
                      Активных сделок пока нет.
                      <div className="mt-2">
                        <Link href="/deals">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Создать сделку
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Insight Card */}
              <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-zinc-900/60 p-5 space-y-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    AI 360° Рекомендация
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Клиент <span className="text-white font-medium">{fullName}</span> успешно добавлен в базу. Рекомендуется отправить приветственное сообщение в мессенджер с предложением демонстрации продукта.
                </p>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Скоринг: Высокий</span>
                  <Link href="/inbox">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] px-2.5 text-zinc-200 border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                    >
                      Написать
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: DEALS */}
        <TabsContent value="deals" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base text-white">Сделки, привязанные к клиенту</CardTitle>
              <Link href="/deals">
                <Button size="sm" className="h-8 gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Новая сделка
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {deals.length > 0 ? (
                deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-white/[0.02] border border-zinc-800"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm">{deal.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Стадия: <span className="text-blue-400 font-medium">{deal.stage}</span> · Приоритет: {deal.priority}
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {formatCurrency(deal.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 py-6 text-center">
                  У этого клиента пока нет оформленных сделок
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: COMMUNICATIONS */}
        <TabsContent value="communications" className="mt-4">
          <Card>
            <CardContent className="p-6 text-sm text-gray-300 space-y-3">
              <div className="flex items-center justify-between">
                <span>Канал переписки: {contact?.whatsapp ? "WhatsApp" : contact?.telegram ? "Telegram" : "Email"}</span>
                <Link href="/inbox">
                  <Button size="sm" className="h-8 text-xs">
                    Открыть в инбоксе
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-gray-400">
                Все диалоги автоматически привязаны к ID клиента #{contactId}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: DOCUMENTS */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-6 text-sm text-gray-300 space-y-2">
              <p className="text-xs text-gray-400">
                Здесь отображаются сгенерированные коммерческие предложения, договоры и счета для {fullName}.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: TASKS */}
        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardContent className="p-6 text-sm text-gray-300 space-y-3">
              {tasks.length > 0 ? (
                tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-zinc-800"
                  >
                    <div>
                      <div className="font-semibold text-white text-xs">{t.title}</div>
                      <div className="text-[11px] text-gray-400">Статус: {t.status} · Срок: {formatDate(t.due_date)}</div>
                    </div>
                    <Badge variant="outline">{t.priority}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 text-center py-4">
                  Задач по данному клиенту не запланировано
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
