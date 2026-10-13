"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Building2,
  Wrench,
  ShoppingBag,
  Briefcase,
  Heart,
  GraduationCap,
  UserPlus,
  MessageCircle,
  Send,
  Mail,
  Phone,
  Upload,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Bot,
  Loader2,
  FileSpreadsheet,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  from: "ai" | "user";
  text: string;
  ts: number;
}

type StepId =
  | "welcome"
  | "company"
  | "industry"
  | "first_contact"
  | "channels"
  | "price_list"
  | "done";

const STEP_ORDER: StepId[] = [
  "welcome",
  "company",
  "industry",
  "first_contact",
  "channels",
  "price_list",
  "done",
];

// ─── AI Messages per step ────────────────────────────────────────────────────
const AI_SCRIPTS: Record<StepId, string[]> = {
  welcome: [
    "👋 Привет! Я Nexus — ваш AI-ассистент первой настройки.",
    "Я помогу запустить CRM за несколько минут: настроим компанию, добавим первого клиента, подключим каналы и загрузим прайс.",
    "Начнём? Давайте сначала познакомимся с вашим бизнесом. ✨",
  ],
  company: [
    "Отлично! Как называется ваша компания?",
    "Это имя будет отображаться в системе, счётах и шаблонах документов.",
  ],
  industry: [
    "Хорошо! Теперь выберите сферу деятельности.",
    "Это поможет мне настроить воронку продаж, стадии сделок и шаблоны задач под вашу отрасль. 🎯",
  ],
  first_contact: [
    "Супер! Теперь добавим вашего первого клиента.",
    "Введите имя и контакт — всё остальное можно дополнить позже.",
  ],
  channels: [
    "Отличный старт! Теперь настроим каналы коммуникации.",
    "Выберите мессенджеры, через которые приходят ваши клиенты. Потом я подключу AI-автоответы на каждый канал. 🤖",
  ],
  price_list: [
    "Почти готово! Последний шаг — загрузите ваш прайс-лист.",
    "Поддерживаются Excel (.xlsx), CSV или просто введите позиции вручную. Прайс автоматически свяжется со складом и счетами.",
  ],
  done: [
    "🎉 Nexus CRM полностью настроен!",
    "Ваша команда готова к работе. AI-агенты активированы и ждут первых обращений клиентов.",
  ],
};

// ─── Industries ──────────────────────────────────────────────────────────────
const INDUSTRIES = [
  { id: "trade", label: "Торговля / Опт / Ритейл", icon: ShoppingBag },
  { id: "services", label: "Услуги / Консалтинг", icon: Briefcase },
  { id: "construction", label: "Строительство / Ремонт", icon: Wrench },
  { id: "beauty", label: "Красота / Здоровье / SPA", icon: Heart },
  { id: "education", label: "Образование / Онлайн-школа", icon: GraduationCap },
  { id: "it", label: "IT / Технологии / SaaS", icon: Globe },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>("welcome");
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [channels, setChannels] = useState({ whatsapp: false, telegram: false, email: false });
  const [priceFile, setPriceFile] = useState<File | null>(null);
  const [priceItems, setPriceItems] = useState([{ name: "", price: "" }]);
  const [submitting, setSubmitting] = useState(false);

  const stepIndex = STEP_ORDER.indexOf(step);
  const progressPct = Math.round((stepIndex / (STEP_ORDER.length - 1)) * 100);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiTyping]);

  // Play AI messages for current step
  const playAIMessages = async (stepId: StepId) => {
    const lines = AI_SCRIPTS[stepId];
    setAiTyping(true);
    await delay(400);
    for (const line of lines) {
      await delay(700);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, from: "ai", text: line, ts: Date.now() },
      ]);
      setAiTyping(false);
      await delay(300);
      if (lines.indexOf(line) < lines.length - 1) setAiTyping(true);
    }
  };

  // Initial messages
  useEffect(() => {
    playAIMessages("welcome");
  }, []);

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-u`, from: "user", text, ts: Date.now() },
    ]);
  };

  const goNext = async (nextStep: StepId, userMessage?: string) => {
    if (userMessage) addUserMessage(userMessage);
    await delay(300);
    setStep(nextStep);
    await playAIMessages(nextStep);
  };

  // ── Step handlers ──
  const handleCompanySubmit = async () => {
    if (!companyName.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/system/setup-tenant", {
        company_name: companyName,
        website: companyWebsite || null,
      }).catch(() => {}); // non-blocking
    } finally {
      setSubmitting(false);
    }
    goNext("industry", `Наша компания: «${companyName}»`);
  };

  const handleIndustrySelect = (id: string, label: string) => {
    setSelectedIndustry(id);
    goNext("first_contact", `Наша сфера: ${label}`);
  };

  const handleContactSubmit = async () => {
    if (!contactName.trim()) return;
    setSubmitting(true);
    try {
      const [firstName, ...rest] = contactName.trim().split(" ");
      await api.post("/contacts", {
        first_name: firstName,
        last_name: rest.join(" ") || null,
        phone: contactPhone || null,
        email: contactEmail || null,
        status: "lead",
        tags: ["Первый клиент", "Онбординг"],
      }).catch(() => {});
    } finally {
      setSubmitting(false);
    }
    goNext("channels", `Первый клиент добавлен: ${contactName}`);
  };

  const handleChannelsSubmit = () => {
    const selected = Object.entries(channels)
      .filter(([, v]) => v)
      .map(([k]) => ({ whatsapp: "WhatsApp", telegram: "Telegram", email: "Email" }[k]))
      .join(", ");
    goNext("price_list", selected ? `Выбраны каналы: ${selected}` : "Каналы настрою позже");
  };

  const handlePriceSubmit = async () => {
    setSubmitting(true);
    try {
      if (priceFile) {
        // File upload placeholder — would call /products/import in real impl
        await delay(800);
      } else {
        // Create manual items
        for (const item of priceItems.filter((i) => i.name)) {
          await api.post("/products", {
            name: item.name,
            price: parseFloat(item.price) || 0,
          }).catch(() => {});
        }
      }
    } finally {
      setSubmitting(false);
    }
    // Mark onboarding complete
    localStorage.setItem("nexus_onboarding_done", "1");
    goNext("done", priceFile ? `Загружен файл: ${priceFile.name}` : "Прайс введён вручную");
  };

  const handleSkipPrice = () => {
    localStorage.setItem("nexus_onboarding_done", "1");
    goNext("done", "Прайс загружу позже");
  };

  const handleFinish = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50">
      {/* ── LEFT PANEL: AI Chat ─────────────────────────── */}
      <div className="w-full md:w-[420px] md:min-h-screen flex flex-col bg-white border-b md:border-b-0 md:border-r border-slate-200 shadow-sm">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Nexus Onboarding AI</p>
            <p className="text-[11px] text-slate-400">Ваш ассистент первой настройки</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-600 font-medium">Online</span>
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 py-3 border-b border-slate-50">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Прогресс настройки</span>
            <span className="font-semibold text-slate-600">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
          <div className="flex gap-1 mt-2">
            {STEP_ORDER.filter((s) => s !== "done").map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  STEP_ORDER.indexOf(step) > i
                    ? "bg-blue-600"
                    : STEP_ORDER.indexOf(step) === i
                    ? "bg-blue-400"
                    : "bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 md:max-h-[calc(100vh-180px)]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-2.5 max-w-[85%]", msg.from === "user" && "ml-auto flex-row-reverse")}
            >
              {msg.from === "ai" && (
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                  msg.from === "ai"
                    ? "bg-slate-100 text-slate-800 rounded-tl-sm"
                    : "bg-blue-600 text-white rounded-tr-sm"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {aiTyping && (
            <div className="flex gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="px-4 py-3 bg-slate-100 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── RIGHT PANEL: Action Form ─────────────────────── */}
      <div className="flex-1 flex items-start md:items-center justify-center p-5 md:p-10">
        <div className="w-full max-w-lg">

          {/* STEP: WELCOME */}
          {step === "welcome" && (
            <div className="text-center space-y-8">
              <div className="relative inline-block">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mx-auto">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">AI</span>
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-slate-900">
                  Добро пожаловать в <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Nexus CRM</span>
                </h1>
                <p className="text-slate-500 text-base leading-relaxed max-w-sm mx-auto">
                  Давайте настроим систему вместе. Займёт 3–5 минут и сэкономит часы ручной работы.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-500">
                {[
                  { n: "1", t: "Компания" },
                  { n: "2", t: "Клиент" },
                  { n: "3", t: "Каналы" },
                  { n: "4", t: "Прайс" },
                  { n: "5", t: "Готово!" },
                ].map((s) => (
                  <div key={s.n} className="flex flex-col items-center gap-1">
                    <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {s.n}
                    </div>
                    <span>{s.t}</span>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                className="w-full h-12 text-base gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => goNext("company")}
              >
                Начать настройку
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* STEP: COMPANY */}
          {step === "company" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs mb-2">Шаг 1 из 5</Badge>
                <h2 className="text-2xl font-bold text-slate-900">Данные вашей компании</h2>
                <p className="text-slate-500 text-sm">Будут использоваться в счётах, документах и при общении с клиентами</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Название компании *</label>
                  <Input
                    placeholder="ТОО «KazAgro» или ИП Иванов"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-11 text-base"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleCompanySubmit()}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Сайт (необязательно)</label>
                  <Input
                    placeholder="https://your-company.kz"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={!companyName.trim() || submitting}
                onClick={handleCompanySubmit}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Сохранить и продолжить
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP: INDUSTRY */}
          {step === "industry" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs mb-2">Шаг 2 из 5</Badge>
                <h2 className="text-2xl font-bold text-slate-900">Сфера деятельности</h2>
                <p className="text-slate-500 text-sm">AI настроит воронку и этапы сделок под вашу отрасль</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INDUSTRIES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleIndustrySelect(id, label)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border text-left transition-all group",
                      selectedIndustry === id
                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg transition-colors",
                      selectedIndustry === id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-800">{label}</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto group-hover:text-blue-500" />
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full text-slate-400 text-sm"
                onClick={() => handleIndustrySelect("other", "Другая сфера")}
              >
                Другая сфера → пропустить
              </Button>
            </div>
          )}

          {/* STEP: FIRST CONTACT */}
          {step === "first_contact" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs mb-2">Шаг 3 из 5</Badge>
                <h2 className="text-2xl font-bold text-slate-900">Добавьте первого клиента</h2>
                <p className="text-slate-500 text-sm">Проверим, что система работает — добавим реального клиента прямо сейчас</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Имя клиента *</label>
                  <Input
                    placeholder="Арман Сериков"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="h-11 text-base"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Телефон / WhatsApp</label>
                    <Input
                      placeholder="+7 (777) 000-00-00"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Email</label>
                    <Input
                      type="email"
                      placeholder="client@mail.kz"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 text-slate-500"
                  onClick={() => goNext("channels", "Клиента добавлю позже")}
                >
                  Пропустить
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-11 gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={!contactName.trim() || submitting}
                  onClick={handleContactSubmit}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Добавить клиента
                </Button>
              </div>
            </div>
          )}

          {/* STEP: CHANNELS */}
          {step === "channels" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs mb-2">Шаг 4 из 5</Badge>
                <h2 className="text-2xl font-bold text-slate-900">Каналы связи с клиентами</h2>
                <p className="text-slate-500 text-sm">Выберите каналы. После настройки AI-агент будет отвечать там автоматически.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: "whatsapp" as const,
                    icon: MessageCircle,
                    label: "WhatsApp Business",
                    desc: "AI-автоответы за 3 сек, приём лидов 24/7",
                    color: "emerald",
                    badge: "Популярный",
                  },
                  {
                    key: "telegram" as const,
                    icon: Send,
                    label: "Telegram Bot",
                    desc: "Мгновенный приём заявок и уведомления команде",
                    color: "blue",
                    badge: null,
                  },
                  {
                    key: "email" as const,
                    icon: Mail,
                    label: "Email (IMAP/SMTP)",
                    desc: "Авто-создание сделок из входящих писем",
                    color: "indigo",
                    badge: null,
                  },
                ].map(({ key, icon: Icon, label, desc, color, badge }) => {
                  const active = channels[key];
                  return (
                    <label
                      key={key}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                        active
                          ? `border-${color}-400 bg-${color}-50 shadow-sm`
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2.5 rounded-lg",
                          active ? `bg-${color}-100 text-${color}-700` : "bg-slate-100 text-slate-500"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">{label}</span>
                            {badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setChannels({ ...channels, [key]: e.target.checked })}
                        className="h-4 w-4 rounded accent-blue-600"
                      />
                    </label>
                  );
                })}
              </div>

              {Object.values(channels).some(Boolean) && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Zap className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Подключение происходит в разделе <strong>Интеграции</strong> — там вы вставите токены и API-ключи. Сейчас просто отметьте нужные каналы.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 text-slate-500"
                  onClick={() => goNext("price_list", "Каналы настрою позже")}
                >
                  Позже
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-11 gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={handleChannelsSubmit}
                >
                  Продолжить
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: PRICE LIST */}
          {step === "price_list" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs mb-2">Шаг 5 из 5</Badge>
                <h2 className="text-2xl font-bold text-slate-900">Загрузите прайс-лист</h2>
                <p className="text-slate-500 text-sm">Товары и услуги свяжутся со складом и будут доступны при создании счётов</p>
              </div>

              {/* File upload zone */}
              <label className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all group">
                <FileSpreadsheet className="h-10 w-10 text-slate-300 group-hover:text-blue-400 transition-colors mb-3" />
                <p className="text-sm font-medium text-slate-600 group-hover:text-blue-700">
                  {priceFile ? priceFile.name : "Перетащите файл или нажмите для выбора"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Excel (.xlsx), CSV — до 10 МБ</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.csv,.xls"
                  onChange={(e) => setPriceFile(e.target.files?.[0] || null)}
                />
              </label>

              {/* OR manual entry */}
              {!priceFile && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">или введите вручную</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="space-y-2">
                    {priceItems.map((item, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <Input
                            placeholder={`Товар или услуга ${i + 1}`}
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...priceItems];
                              updated[i] = { ...updated[i], name: e.target.value };
                              setPriceItems(updated);
                            }}
                            className="h-9 text-sm"
                          />
                        </div>
                        <Input
                          placeholder="Цена ₸"
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const updated = [...priceItems];
                            updated[i] = { ...updated[i], price: e.target.value };
                            setPriceItems(updated);
                          }}
                          className="h-9 text-sm"
                        />
                      </div>
                    ))}
                    {priceItems.length < 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400 gap-1"
                        onClick={() => setPriceItems([...priceItems, { name: "", price: "" }])}
                      >
                        + Добавить строку
                      </Button>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 text-slate-500"
                  onClick={handleSkipPrice}
                >
                  Пропустить
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-11 gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={submitting}
                  onClick={handlePriceSubmit}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {priceFile ? "Загрузить файл" : "Сохранить позиции"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP: DONE */}
          {step === "done" && (
            <div className="text-center space-y-8">
              <div className="relative inline-block">
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce text-2xl">🎉</div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-slate-900">
                  Nexus CRM готов к работе!
                </h2>
                <p className="text-slate-500 text-base leading-relaxed max-w-sm mx-auto">
                  Система настроена. Переходите в дашборд и начинайте работать с клиентами.
                </p>
              </div>

              {/* Checklist */}
              <div className="text-left space-y-2 max-w-xs mx-auto">
                {[
                  "Компания и тенант настроены",
                  "База контактов инициализирована",
                  "Каналы выбраны",
                  "Номенклатура создана",
                  "AI-агенты активированы",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full h-12 text-base gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleFinish}
              >
                <Sparkles className="h-5 w-5" />
                Открыть Nexus CRM
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Utils ────────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
