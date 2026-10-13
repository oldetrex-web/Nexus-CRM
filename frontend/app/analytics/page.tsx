"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  BarChart2,
  Sparkles,
  ArrowRight,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsData {
  totalDeals: number;
  totalContacts: number;
  totalCompanies: number;
  totalPipeline: number;
  wonDeals: number;
  lostDeals: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [dealsRes, contactsRes, companiesRes] = await Promise.allSettled([
        api.get("/deals"),
        api.get("/contacts"),
        api.get("/companies"),
      ]);

      const deals = dealsRes.status === "fulfilled" ? (dealsRes.value.data || []) : [];
      const contacts = contactsRes.status === "fulfilled" ? (contactsRes.value.data || []) : [];
      const companies = companiesRes.status === "fulfilled" ? (companiesRes.value.data || []) : [];

      const totalPipeline = deals.reduce((s: number, d: any) => s + (Number(d.amount) || 0), 0);
      const wonDeals = deals.filter((d: any) => d.stage === "won").length;
      const lostDeals = deals.filter((d: any) => d.stage === "lost").length;

      setData({
        totalDeals: deals.length,
        totalContacts: contacts.length,
        totalCompanies: companies.length,
        totalPipeline,
        wonDeals,
        lostDeals,
      });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const isEmpty = data && data.totalDeals === 0 && data.totalContacts === 0;
  const conversionRate =
    data && data.totalDeals > 0
      ? Math.round((data.wonDeals / data.totalDeals) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Аналитика & KPI</span>
            <Badge variant="default" className="text-xs font-mono py-0.5">
              Real-time
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {loading
              ? "Сбор данных из базы..."
              : isEmpty
              ? "Аналитика появится после добавления первых данных"
              : "Сводные показатели на основе реальных данных из БД"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          disabled={loading}
          className="gap-2 text-xs h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Сумма пайплайна</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {loading ? "—" : data ? formatCurrency(data.totalPipeline) : "0 ₸"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data && data.totalDeals > 0 ? `из ${data.totalDeals} сделок` : "нет активных сделок"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Конверсия воронки</span>
            <Target className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {loading ? "—" : `${conversionRate}%`}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data ? `${data.wonDeals} выиграно / ${data.lostDeals} проиграно` : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Контактов в базе</span>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {loading ? "—" : data?.totalContacts ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">клиентов и лидов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Компаний</span>
            <TrendingUp className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {loading ? "—" : data?.totalCompanies ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">контрагентов</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Empty State or Charts placeholder */}
      {isEmpty || (!loading && !data) ? (
        /* Empty State */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
                <BarChart2 className="h-8 w-8 text-indigo-500" />
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">
                  Аналитика появится здесь
                </h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                  Начните добавлять контакты, компании и сделки. Система автоматически
                  построит графики конверсий, динамику выручки и KPI воронки продаж.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/contacts">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Добавить контакты
                  </Button>
                </Link>
                <Link href="/deals">
                  <Button size="sm" className="gap-2">
                    <Briefcase className="h-3.5 w-3.5" />
                    Создать сделки
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Feature Preview Cards */}
          {[
            {
              title: "Динамика выручки",
              desc: "График роста продаж по месяцам с планом vs фактом",
              icon: TrendingUp,
              color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
            },
            {
              title: "Конверсия воронки",
              desc: "Процент перехода лидов через каждый этап воронки",
              icon: Target,
              color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10",
            },
            {
              title: "AI диагностика",
              desc: "Автоматический поиск узких мест и рекомендации",
              icon: Sparkles,
              color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10",
            },
            {
              title: "KPI менеджеров",
              desc: "Рейтинг результативности и выполнение плана",
              icon: Users,
              color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
            },
          ].map((f) => (
            <Card key={f.title} className="opacity-60 pointer-events-none select-none">
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-zinc-200 text-sm">{f.title}</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{f.desc}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">
                    Появится после добавления данных
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Has data — show live stats breakdown */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deals breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                Сделки по статусам
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Новый лид", stage: "new", color: "bg-blue-500" },
                { label: "Квалификация", stage: "qualification", color: "bg-indigo-500" },
                { label: "Предложение", stage: "proposal", color: "bg-purple-500" },
                { label: "Переговоры", stage: "negotiation", color: "bg-amber-500" },
                { label: "Успешно", stage: "won", color: "bg-emerald-500" },
                { label: "Проиграно", stage: "lost", color: "bg-slate-400" },
              ].map((s) => (
                <div key={s.stage} className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${s.color} shrink-0`} />
                  <span className="text-xs text-slate-600 dark:text-zinc-300 flex-1">{s.label}</span>
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-zinc-100">
                    {loading ? "—" : "0"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Аналитик
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-950/40">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                  AI анализирует данные
                </p>
                <p className="text-xs text-slate-400 max-w-[220px]">
                  Рекомендации и инсайты появятся после накопления минимального объёма данных
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
