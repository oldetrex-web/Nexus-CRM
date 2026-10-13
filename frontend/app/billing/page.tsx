"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Download,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Users,
  MessageSquare,
  HardDrive,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const plans = [
  {
    id: "trial",
    name: "Trial (Тестовый)",
    price: "0 ₸",
    period: "3 дня",
    description: "Полный доступ ко всем функциям CRM и AI без ограничений на 3 дня",
    users: "10 пользователей",
    ai: "1 000 AI/день",
    channels: "5 каналов связи",
    storage: "5 ГБ",
    badge: "Текущий статус",
    isCurrent: true,
    highlight: false,
  },
  {
    id: "free",
    name: "Free",
    price: "0 ₸",
    period: "навсегда",
    description: "Базовый доступ для индивидуальных предпринимателей и самозанятых",
    users: "1 пользователь",
    ai: "10 AI/день",
    channels: "1 канал связи",
    storage: "500 МБ",
    badge: null,
    isCurrent: false,
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "9 900 ₸",
    period: "в месяц",
    description: "Для небольших отделов продаж и растущих стартапов",
    users: "3 пользователя",
    ai: "100 AI/день",
    channels: "3 канала связи",
    storage: "10 ГБ",
    badge: null,
    isCurrent: false,
    highlight: false,
  },
  {
    id: "business",
    name: "Business",
    price: "29 900 ₸",
    period: "в месяц",
    description: "Оптимальный тариф для активных коммерческих отделов",
    users: "15 пользователей",
    ai: "1 000 AI/день",
    channels: "10 каналов связи",
    storage: "50 ГБ",
    badge: "Популярный выбор",
    isCurrent: false,
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "99 900 ₸",
    period: "в месяц",
    description: "Безлимитная корпоративная инфраструктура с выделенным SLA",
    users: "∞ без ограничений",
    ai: "∞ без ограничений",
    channels: "∞ без ограничений",
    storage: "1 ТБ NVMe",
    badge: "VIP Корпоративный",
    isCurrent: false,
    highlight: false,
  },
];

const invoiceHistory: {
  id: string;
  number: string;
  date: string;
  plan: string;
  amount: string;
  method: string;
  status: string;
}[] = [];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState("business");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <span>Тарифные планы & SaaS Биллинг</span>
            <Badge variant="warning" className="text-xs font-mono py-0.5 gap-1">
              <Clock className="h-3 w-3" />
              Trial 3 дня
            </Badge>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Управление корпоративной подпиской, лимитами пользователей и AI-токенов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Kaspi Pay / Stripe</span>
          </Button>
        </div>
      </div>

      {/* Active Trial Notice Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 dark:border-amber-500/20 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Действует пробный период (3 дня с полным доступом)
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
              Вам доступны все AI-агенты, парсер прайсов и интеграции. До авто-блокировки осталось: <strong className="font-mono">2 дня 14 часов</strong>. Выберите подходящий тариф для продления.
            </p>
          </div>
        </div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-medium shrink-0 shadow-sm">
          Активировать подписку
        </Button>
      </div>

      {/* Pricing Cards Grid (5 Tiers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {plans.map((p) => {
          const isSelected = selectedPlan === p.id;
          return (
            <Card
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`relative flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                p.highlight
                  ? "border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-md"
                  : p.isCurrent
                  ? "border-amber-400/80"
                  : "hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {p.name}
                  </span>
                  {p.badge && (
                    <Badge
                      variant={p.highlight ? "default" : p.isCurrent ? "warning" : "secondary"}
                      className="text-[10px] py-0 px-1.5"
                    >
                      {p.badge}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono">
                    {p.price}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {p.period}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-2">
                  {p.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-3 pt-2 border-t border-zinc-100 dark:border-white/[0.05]">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{p.users}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{p.ai}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <MessageSquare className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{p.channels}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <HardDrive className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{p.storage}</span>
                  </div>
                </div>

                <div className="pt-3">
                  <Button
                    variant={p.highlight ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs font-medium"
                  >
                    {p.isCurrent ? "Текущий тариф" : "Выбрать план"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods and Integration Adapters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-zinc-900 dark:text-white flex items-center justify-between">
            <span>Доступные способы оплаты (Платежные шлюзы)</span>
            <span className="text-xs text-zinc-500 font-normal">Native First · Dual-Direction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">Kaspi Pay QR / Счет</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Оплата для юр. лиц в тенге (₸) через Kaspi Business</p>
              </div>
              <Badge variant="success" className="text-[10px]">Подключено</Badge>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">Stripe Checkout</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Международные карты Visa, MasterCard, Apple Pay</p>
              </div>
              <Badge variant="success" className="text-[10px]">Активно</Badge>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">Безналичный расчет (Счет)</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Выставление счета на оплату с актами выполненных работ</p>
              </div>
              <Badge variant="outline" className="text-[10px]">Доступно</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-zinc-900 dark:text-white">
            История счетов и платежей
          </CardTitle>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <Download className="h-3.5 w-3.5" />
            <span>Выгрузить все акты</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead>Номер счета</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Тариф / Услуга</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Способ оплаты</TableHead>
                <TableHead className="text-right">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-slate-500">
                    Платежей пока нет — счета появятся после оплаты подписки
                  </TableCell>
                </TableRow>
              ) : (
                invoiceHistory.map((inv) => (
                  <TableRow key={inv.id} className="border-b border-zinc-100 dark:border-white/[0.04]">
                    <TableCell className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                      {inv.number}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {inv.date}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {inv.plan}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {inv.amount}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                      {inv.method}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="success">Оплачено</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
