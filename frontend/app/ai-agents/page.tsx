"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Zap,
  Activity,
  CheckCircle2,
  Settings2,
  Terminal,
  Sparkles,
  Clock,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Cpu,
  Wifi,
  WifiOff,
  Circle,
  MessageSquare,
  Package,
  BarChart3,
  Wand2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";

// ─── System Agents — always-on, never toggled off ─────────────────────────────
interface SystemAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  model: string;
  triggers: string[];
  capabilities: string[];
  needsSetup: "integration" | "rag" | "none";
  setupNote?: string;
}

const SYSTEM_AGENTS: SystemAgent[] = [
  {
    id: "sales",
    name: "Sales Hunter",
    role: "Квалификация лидов · Продажи",
    description:
      "Отвечает в Telegram/WhatsApp/Email за ≤3 сек, квалифицирует бюджет клиента по BANT-методологии, формирует КП из прайса и создаёт сделку в CRM.",
    icon: MessageSquare,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-500/30",
    model: "Gemini 2.0 Flash",
    triggers: ["Новое сообщение в инбоксе", "Новый лид из формы", "Входящий звонок (Zadarma)"],
    capabilities: ["Автоответ в мессенджерах", "Формирование КП из прайса", "Создание сделки в Kanban"],
    needsSetup: "integration",
    setupNote: "Подключите Telegram или WhatsApp чтобы агент начал работу",
  },
  {
    id: "support",
    name: "Customer Care",
    role: "Поддержка 24/7 · FAQ · Статусы",
    description:
      "Отвечает на типовые вопросы по заказам, доставке и оплате, используя базу знаний (RAG). Эскалирует сложные кейсы живому менеджеру.",
    icon: ShieldCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-500/30",
    model: "Gemini 2.0 Flash",
    triggers: ["Вопрос в чате", "Запрос статуса заказа", "FAQ-запрос"],
    capabilities: ["Поиск по базе знаний (RAG)", "Ответ на статус сделки", "Эскалация менеджеру"],
    needsSetup: "rag",
    setupNote: "Загрузите документы в базу знаний чтобы агент отвечал точно",
  },
  {
    id: "analyst",
    name: "Revenue Analyst",
    role: "Аналитика · Скоринг · Прогнозы",
    description:
      "Оценивает вероятность закрытия каждой сделки, выявляет узкие места воронки, генерирует еженедельный отчёт РОПу по ключевым метрикам.",
    icon: BarChart3,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-200 dark:border-purple-500/30",
    model: "Gemini 2.0 Flash",
    triggers: ["Ежедневно в 09:00", "Изменение стадии сделки", "По запросу"],
    capabilities: ["Скоринг вероятности закрытия", "Анализ воронки", "Еженедельный отчёт"],
    needsSetup: "none",
  },
  {
    id: "warehouse",
    name: "Inventory Guard",
    role: "Склад · Резервы · Авто-закупки",
    description:
      "Отслеживает остатки ниже критического уровня, автоматически резервирует товары при создании сделок и формирует заявки поставщикам.",
    icon: Package,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-500/30",
    model: "Gemini 2.0 Flash",
    triggers: ["Создание сделки", "Резерв товара", "Остаток < минимум"],
    capabilities: ["Авто-резерв при сделке", "Уведомление о дефиците", "Заявка поставщику"],
    needsSetup: "none",
  },
  {
    id: "onboarding",
    name: "Onboarding Assistant",
    role: "Новые тенанты · Первая настройка",
    description:
      "Встречает нового пользователя при первом входе и ведёт поэтапно: настройка компании, добавление контакта, подключение каналов, загрузка прайса.",
    icon: Wand2,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    borderColor: "border-indigo-200 dark:border-indigo-500/30",
    model: "Gemini 2.0 Flash",
    triggers: ["Первый вход в систему", "По запросу пользователя"],
    capabilities: ["Пошаговый онбординг", "Настройка компании", "Подключение каналов"],
    needsSetup: "none",
  },
  {
    id: "price_parser",
    name: "Price Intelligence",
    role: "Прайсы · Импорт · Обновления",
    description:
      "Автоматически распознаёт прайс-листы поставщиков в любом формате (Excel, PDF, CSV), маппирует колонки и обновляет склад без ручного ввода.",
    icon: Zap,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
    borderColor: "border-cyan-200 dark:border-cyan-500/30",
    model: "Gemini 2.0 Flash (Vision)",
    triggers: ["Загрузка файла прайса", "Email от поставщика", "По расписанию"],
    capabilities: ["AI Document Vision", "Авто-маппинг колонок", "Обновление склада"],
    needsSetup: "none",
  },
];

interface AgentStats {
  id: string;
  requests_today: number;
  requests_month: number;
  avg_latency_ms: number;
  status: "running" | "waiting" | "no_integration";
}

export default function AiAgentsPage() {
  const [stats, setStats] = useState<Record<string, AgentStats>>({});
  const [loading, setLoading] = useState(false);
  const [geminiKeySet, setGeminiKeySet] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ai-agents/stats");
      const map: Record<string, AgentStats> = {};
      (res.data || []).forEach((s: AgentStats) => { map[s.id] = s; });
      setStats(map);
      setGeminiKeySet(true);
    } catch {
      // No stats yet — all agents are "waiting for setup"
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const getAgentStatusBadge = (agent: SystemAgent) => {
    const s = stats[agent.id];
    if (s?.status === "running") {
      return (
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Активен · Online</span>
        </div>
      );
    }
    if (agent.needsSetup === "integration") {
      return (
        <div className="flex items-center gap-1.5">
          <WifiOff className="h-3 w-3 text-amber-500" />
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Ждёт интеграцию</span>
        </div>
      );
    }
    if (agent.needsSetup === "rag") {
      return (
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3 w-3 text-amber-500" />
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Ждёт базу знаний</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Активен · Ждёт событий</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>AI Агенты системы</span>
            <Badge variant="default" className="text-xs font-mono py-0.5 gap-1">
              <Sparkles className="h-3 w-3" /> Always-On
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Все агенты всегда активны — они реагируют на события автоматически, без ручного запуска
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="h-9 text-xs gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/knowledge-base">
            <Button variant="outline" size="sm" className="gap-2 h-9 text-xs">
              <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> База знаний (RAG)
            </Button>
          </Link>
        </div>
      </div>

      {/* Always-On Banner */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
          <Cpu className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Агенты работают в фоне постоянно
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">
            Nexus AI запускает все агенты автоматически при старте системы. Они слушают события (сообщения, сделки, остатки)
            и реагируют без вашего участия — 24/7. Никакого ручного включения не требуется.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{SYSTEM_AGENTS.length} агентов</span>
          </div>
          <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60">Gemini 2.0 Flash</span>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {SYSTEM_AGENTS.map((agent) => {
          const Icon = agent.icon;
          const s = stats[agent.id];

          return (
            <Card
              key={agent.id}
              className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm flex flex-col"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${agent.bgColor} border ${agent.borderColor} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${agent.color}`} />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                        {agent.name}
                      </CardTitle>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate mt-0.5">
                        {agent.role}
                      </span>
                    </div>
                  </div>
                  {/* No toggle — always on */}
                  <div className="shrink-0 pt-0.5">
                    {getAgentStatusBadge(agent)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 flex flex-col">
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {agent.description}
                </p>

                {/* Setup note if needed */}
                {agent.needsSetup !== "none" && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">{agent.setupNote}</p>
                      <Link
                        href={agent.needsSetup === "integration" ? "/integrations" : "/knowledge-base"}
                        className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-0.5 mt-0.5"
                      >
                        {agent.needsSetup === "integration" ? "→ Подключить канал" : "→ Загрузить документы"}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Triggers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Триггеры</span>
                  <div className="flex flex-wrap gap-1">
                    {agent.triggers.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-1">
                  {agent.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      {cap}
                    </div>
                  ))}
                </div>

                {/* Stats if available */}
                {s && (
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-white/[0.06] grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div>
                      <p className="text-slate-400">Сегодня</p>
                      <p className="font-mono font-semibold text-slate-800 dark:text-zinc-100">{s.requests_today}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Месяц</p>
                      <p className="font-mono font-semibold text-slate-800 dark:text-zinc-100">{s.requests_month}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Задержка</p>
                      <p className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{s.avg_latency_ms}мс</p>
                    </div>
                  </div>
                )}

                {/* Model + Configure */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono gap-1">
                    <Cpu className="h-2.5 w-2.5" /> {agent.model}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200">
                    <Settings2 className="h-3 w-3" /> Промпт
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="text-center py-4">
        <p className="text-xs text-slate-400 dark:text-zinc-500">
          Все агенты используют <strong className="text-indigo-600 dark:text-indigo-400">Gemini 2.0 Flash</strong> — добавьте API ключ в{" "}
          <Link href="/settings" className="text-indigo-600 dark:text-indigo-400 underline">
            Настройки → AI & RAG
          </Link>
        </p>
      </div>
    </div>
  );
}
