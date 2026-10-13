"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  LogOut,
  Save,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Sun,
  Moon,
  Bot,
  BookOpen,
  Wand2,
  Sparkles,
  ExternalLink,
  Zap,
  Link2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setCurrentTheme(isDark ? "dark" : "light");
  }, []);

  const handleThemeChange = (theme: "light" | "dark") => {
    setCurrentTheme(theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("nexus-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("nexus-theme", "light");
    }
  };

  // Notifications state
  const [notifications, setNotifications] = useState({
    newDeals: true,
    chatMessages: true,
    aiAlerts: true,
    emailDaily: false,
    kpiWeekly: true,
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Системные Настройки
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Конфигурация учетной записи, данных компании, уведомлений и внешнего вида
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 overflow-x-auto justify-start h-11 w-full">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="company">Компания</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            AI & RAG
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFILE */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-zinc-100">Личные данные</CardTitle>
              <CardDescription className="text-slate-500 dark:text-zinc-400">
                Управление контактной информацией вашего аккаунта в CRM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Имя</label>
                  <Input defaultValue={user?.first_name || "Александр"} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Фамилия</label>
                  <Input defaultValue={user?.last_name || "Белов"} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Электронная почта</label>
                  <Input defaultValue={user?.email || "dongelek86@gmail.com"} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Телефон</label>
                  <Input defaultValue="+7 (777) 123-45-67" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button className="gap-2 text-xs">
                  <Save className="h-4 w-4" />
                  <span>Сохранить изменения</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: COMPANY */}
        <TabsContent value="company" className="mt-4 space-y-4">
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-zinc-100">Профиль Организации</CardTitle>
              <CardDescription className="text-slate-500 dark:text-zinc-400">
                Реквизиты юридического лица для автоматического формирования счетов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Название компании</label>
                  <Input defaultValue="ТОО «Nexus Solutions LLP»" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">БИН организации</label>
                  <Input defaultValue="230440019283" className="font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Юридический адрес</label>
                <Input defaultValue="г. Алматы, Бостандыкский район, пр. Аль-Фараби 77/7, БЦ Esentai Tower" />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/10">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">Текущий тарифный план</div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400">Nexus Business (29,900 ₸ / мес)</div>
                </div>
                <Badge variant="default" className="bg-blue-600 text-white">Активен</Badge>
              </div>

              <div className="flex justify-end pt-2">
                <Button className="gap-2 text-xs">
                  <Save className="h-4 w-4" />
                  <span>Обновить реквизиты</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: NOTIFICATIONS */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-zinc-100">Настройки оповещений</CardTitle>
              <CardDescription className="text-slate-500 dark:text-zinc-400">
                Каналы доставки важных событий и системных алертов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="divide-y divide-slate-200 dark:divide-white/10 space-y-3">
                <label className="flex items-center justify-between pt-3 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Новые лиды и сделки</div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">Мгновенное всплывающее уведомление при новом контакте</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.newDeals}
                    onChange={(e) => setNotifications({ ...notifications, newDeals: e.target.checked })}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between pt-3 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Входящие сообщения в чатах</div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">Звуковой сигнал при поступлении сообщения WhatsApp / Telegram</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.chatMessages}
                    onChange={(e) => setNotifications({ ...notifications, chatMessages: e.target.checked })}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between pt-3 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">AI Агенты и рекомендации</div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">Уведомления о выявленных аномалиях воронки и готовых драфтах ответов</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.aiAlerts}
                    onChange={(e) => setNotifications({ ...notifications, aiAlerts: e.target.checked })}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between pt-3 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Еженедельный отчет KPI</div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">Сводка по продажам и конверсии менеджеров каждый понедельник</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.kpiWeekly}
                    onChange={(e) => setNotifications({ ...notifications, kpiWeekly: e.target.checked })}
                    className="h-4 w-4 rounded accent-blue-600"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button className="gap-2 text-xs">
                  <Save className="h-4 w-4" />
                  <span>Сохранить параметры оповещений</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SECURITY */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-zinc-100">Безопасность и пароль</CardTitle>
              <CardDescription className="text-slate-500 dark:text-zinc-400">
                Защита учетной записи и управление доступами
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Текущий пароль</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Новый пароль</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Повторите новый пароль</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button className="gap-2 text-xs">
                <Lock className="h-4 w-4" />
                <span>Обновить пароль</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: APPEARANCE */}
        <TabsContent value="appearance" className="mt-4 space-y-4">
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-zinc-100">Интерфейс и оформление</CardTitle>
              <CardDescription className="text-slate-500 dark:text-zinc-400">
                Выбор визуального оформления CRM и языка отображения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 max-w-md">
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Тема оформления</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Light option */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      currentTheme === "light"
                        ? "border-blue-600 bg-blue-50/80 text-blue-900 font-semibold shadow-sm ring-1 ring-blue-600"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span className="text-xs">Светлая (Default)</span>
                    </div>
                    {currentTheme === "light" && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />}
                  </button>

                  {/* Dark option */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      currentTheme === "dark"
                        ? "border-blue-500 bg-zinc-800 text-zinc-100 font-semibold shadow-sm ring-1 ring-blue-500"
                        : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs">Темный обсидиан</span>
                    </div>
                    {currentTheme === "dark" && <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Основной язык</label>
                <select className="w-full h-10 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-100">
                  <option value="ru">Русский (KZ / RU)</option>
                  <option value="kz">Қазақша</option>
                  <option value="en">English (US)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: AI & RAG */}
        <TabsContent value="ai" className="mt-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30">
                    <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">AI Агенты</CardTitle>
                    <CardDescription className="text-[11px]">Автономные агенты продаж</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Настройте AI-агентов для автоответов в Telegram, WhatsApp и Email. Агенты работают 24/7, квалифицируют лидов и создают сделки.
                </p>
                <div className="space-y-2">
                  {[
                    { name: "Sales Agent", desc: "Квалификация лидов из инбокса" },
                    { name: "Support Agent", desc: "Ответы на FAQ из базы знаний" },
                    { name: "SDR Agent", desc: "Холодный outreach по контактам" },
                  ].map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-zinc-800/40">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">{agent.name}</p>
                        <p className="text-[11px] text-slate-400">{agent.desc}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Не настроен</Badge>
                    </div>
                  ))}
                </div>
                <Link href="/ai-agents">
                  <Button size="sm" className="w-full gap-2 text-xs mt-1">
                    <Bot className="h-3.5 w-3.5" /> Настроить агентов <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30">
                    <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">База знаний (RAG)</CardTitle>
                    <CardDescription className="text-[11px]">Векторная база для AI</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Загрузите документы, FAQ и прайсы. AI-агенты будут отвечать на основе вашего контента, а не общих знаний.
                </p>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-white/[0.06] text-center">
                  <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">0 документов</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">База знаний пуста</p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  {["PDF, DOCX, TXT, MD", "Автоматическая векторизация", "Семантический поиск"].map((f) => (
                    <p key={f} className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-amber-500" />{f}</p>
                  ))}
                </div>
                <Link href="/knowledge-base">
                  <Button size="sm" variant="outline" className="w-full gap-2 text-xs mt-1">
                    <BookOpen className="h-3.5 w-3.5" /> Открыть базу знаний <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30">
                    <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">AI-Консультант</CardTitle>
                    <CardDescription className="text-[11px]">Онбординг и первая настройка</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Интерактивный AI-ассистент проведёт по всем шагам настройки CRM с нуля.
                </p>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-500/20 space-y-1.5">
                  {["Компания и профиль", "Telegram / WhatsApp", "Прайс-лист поставщика", "Первая воронка продаж"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-purple-700 dark:text-purple-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Link href="/onboarding">
                  <Button size="sm" className="w-full gap-2 text-xs bg-purple-600 hover:bg-purple-700 text-white mt-1">
                    <Wand2 className="h-3.5 w-3.5" /> Запустить онбординг <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" /> Настройки AI-модели
              </CardTitle>
              <CardDescription>Конфигурация языковой модели и параметров генерации</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">API ключ Gemini</label>
                  <Input type="password" placeholder="AIza..." className="h-9 text-xs font-mono" />
                  <p className="text-[11px] text-slate-400">Для AI-агентов и RAG</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Основная модель</label>
                  <select className="w-full h-9 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-100">
                    <option>Gemini 2.0 Flash (рекомендован)</option>
                    <option>Gemini 1.5 Pro</option>
                    <option>Gemini 1.5 Flash</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Язык ответов AI</label>
                  <select className="w-full h-9 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-100">
                    <option>Русский</option>
                    <option>Казахский</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="gap-2 text-xs">
                  <Save className="h-3.5 w-3.5" /> Сохранить настройки AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* DANGER ZONE: LOGOUT */}
      <Card className="border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-950/20 shadow-sm">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Опасная зона</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Завершить текущую сессию и выйти из корпоративной рабочей области
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="gap-2 text-xs w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            <span>Выйти из системы</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
