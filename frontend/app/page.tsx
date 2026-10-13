"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Target,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Users,
  Building2,
  ListTodo,
  RefreshCw,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface DashStats {
  dealsCount: number;
  contactsCount: number;
  companiesCount: number;
  tasksCount: number;
  totalPipelineAmount: number;
  deals: any[];
  contacts: any[];
}

export default function DashboardPage() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashStats>({
    dealsCount: 0,
    contactsCount: 0,
    companiesCount: 0,
    tasksCount: 0,
    totalPipelineAmount: 0,
    deals: [],
    contacts: [],
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Check backend health
      const health = await api.get("/health");
      if (health.data?.status === "healthy") setBackendOnline(true);

      // Fetch all real data in parallel
      const [dealsRes, contactsRes, companiesRes, tasksRes] = await Promise.allSettled([
        api.get("/deals"),
        api.get("/contacts"),
        api.get("/companies"),
        api.get("/tasks"),
      ]);

      const deals = dealsRes.status === "fulfilled" ? (dealsRes.value.data || []) : [];
      const contacts = contactsRes.status === "fulfilled" ? (contactsRes.value.data || []) : [];
      const companies = companiesRes.status === "fulfilled" ? (companiesRes.value.data || []) : [];
      const tasks = tasksRes.status === "fulfilled" ? (tasksRes.value.data || []) : [];

      const totalPipeline = deals.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);

      setStats({
        dealsCount: deals.length,
        contactsCount: contacts.length,
        companiesCount: companies.length,
        tasksCount: tasks.length,
        totalPipelineAmount: totalPipeline,
        deals: deals.slice(0, 5),
        contacts: contacts.slice(0, 4),
      });
    } catch {
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stageCounts = [
    { stage: "Новый лид", count: stats.deals.filter((d) => d.stage === "new").length },
    { stage: "Квалификация", count: stats.deals.filter((d) => d.stage === "qualification").length },
    { stage: "Предложение", count: stats.deals.filter((d) => d.stage === "proposal").length },
    { stage: "Переговоры", count: stats.deals.filter((d) => d.stage === "negotiation").length },
    { stage: "Успешно", count: stats.deals.filter((d) => d.stage === "won").length },
  ].filter((s) => s.count > 0);

  const priorityDeals = stats.deals
    .filter((d) => d.priority === "high" || d.priority === "urgent")
    .slice(0, 4);

  const isDataEmpty =
    stats.dealsCount === 0 &&
    stats.contactsCount === 0 &&
    stats.companiesCount === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>Операционный обзор</span>
            {backendOnline ? (
              <Badge variant="success" className="text-xs font-mono gap-1 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                Backend: Online
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-mono text-slate-400">
                Подключение...
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {loading
              ? "Загрузка данных..."
              : isDataEmpty
              ? "Система готова к работе — начните добавлять данные"
              : "Ключевые показатели из реальной базы данных"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
            className="h-9 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          <Badge variant="default" className="gap-1.5 py-1 px-3 text-xs">
            <Sparkles className="h-3 w-3" />
            AI Ко-пилот активен
          </Badge>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Contacts */}
        <Link href="/contacts">
          <Card className="hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">Контакты</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {loading ? "—" : stats.contactsCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1 group-hover:text-emerald-600 transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
                <span>Открыть список</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Deals */}
        <Link href="/deals">
          <Card className="hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">Сделки в работе</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Briefcase className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {loading ? "—" : stats.dealsCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1 group-hover:text-indigo-600 transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
                <span>Перейти в воронку →</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Pipeline Amount */}
        <Card className="hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">Пайплайн</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              {loading ? "—" : stats.totalPipelineAmount > 0 ? formatCurrency(stats.totalPipelineAmount) : "0 ₸"}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1">
              <span>Сумма активных сделок</span>
            </div>
          </CardContent>
        </Card>

        {/* Companies */}
        <Link href="/companies">
          <Card className="hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">Компании</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Building2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {loading ? "—" : stats.companiesCount}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1 group-hover:text-amber-600 transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
                <span>Контрагенты</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts / Empty State */}
      {isDataEmpty && !loading ? (
        /* Empty State — Getting Started */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              href: "/contacts",
              icon: Users,
              color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
              title: "Добавьте контакты",
              desc: "Создайте первых клиентов и лидов в базе данных",
            },
            {
              href: "/deals",
              icon: Briefcase,
              color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10",
              title: "Создайте сделки",
              desc: "Разместите первые сделки по этапам воронки",
            },
            {
              href: "/companies",
              icon: Building2,
              color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
              title: "Добавьте компании",
              desc: "Зарегистрируйте юридические лица и контрагентов",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer group h-full">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className={`p-4 rounded-xl ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                <span>Воронка сделок по этапам</span>
                <span className="text-xs font-normal text-slate-400">Real-time данные</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stageCounts.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Activity className="h-8 w-8" />
                  <p className="text-sm">Нет данных для отображения</p>
                </div>
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stageCounts}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis
                        dataKey="stage"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        width={70}
                      />
                      <Tooltip
                        formatter={(val: number) => [`${val} сделок`, "Количество"]}
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.97)",
                          borderColor: "#e2e8f0",
                          borderRadius: "8px",
                          color: "#0f172a",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                <span>Последние контакты</span>
                <Link href="/contacts" className="text-xs font-normal text-blue-600 dark:text-blue-400 hover:underline">
                  Все →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
                  <Users className="h-7 w-7" />
                  <p className="text-sm">Контактов пока нет</p>
                  <Link href="/contacts">
                    <Button size="sm" variant="outline" className="text-xs mt-1">
                      Добавить контакт
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.contacts.map((c: any) => (
                    <Link key={c.id} href={`/contacts/${c.id}`}>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0">
                          {c.first_name?.[0]}{c.last_name?.[0] || ""}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 truncate">
                            {c.first_name} {c.last_name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{c.phone || c.email || "—"}</p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Priority Deals */}
      {!isDataEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Priority Deals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                <span>Приоритетные сделки</span>
                <Link href="/deals" className="text-xs font-normal text-blue-600 dark:text-blue-400 hover:underline">
                  Воронка →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {priorityDeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
                  <Briefcase className="h-7 w-7" />
                  <p className="text-sm">Высокоприоритетных сделок нет</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {priorityDeals.map((deal: any) => {
                    const stageProgress: Record<string, number> = {
                      new: 10,
                      qualification: 30,
                      proposal: 50,
                      negotiation: 75,
                      won: 100,
                      lost: 0,
                    };
                    const prog = stageProgress[deal.stage] ?? 20;
                    return (
                      <div
                        key={deal.id}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors border border-slate-200 dark:border-white/[0.08] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {deal.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              {deal.company_id || "—"}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono whitespace-nowrap">
                            {formatCurrency(Number(deal.amount) || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                          <span>{deal.stage}</span>
                          <span className="font-medium text-slate-700 dark:text-zinc-300 font-mono">{prog}%</span>
                        </div>
                        <Progress value={prog} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                <span>Задачи</span>
                <Link href="/tasks" className="text-xs font-normal text-blue-600 dark:text-blue-400 hover:underline">
                  Все задачи →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-400">
                <ListTodo className="h-8 w-8" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.tasksCount}</p>
                  <p className="text-sm mt-1">задач в системе</p>
                </div>
                <Link href="/tasks">
                  <Button size="sm" variant="outline" className="text-xs">
                    Перейти к задачам
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
