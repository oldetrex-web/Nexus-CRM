"use client";

import React from "react";
import {
  Plug,
  MessageCircle,
  CreditCard,
  Calendar,
  Phone,
  HardDrive,
  BarChart,
  CheckCircle2,
  Circle,
  ExternalLink,
  ArrowUpRight,
  ArrowRightLeft,
  Key,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface IntegrationItem {
  id: string;
  name: string;
  desc: string;
  connected: boolean;
  isNative: boolean;
}

interface CategoryGroup {
  category: string;
  icon: any;
  items: IntegrationItem[];
}

const integrationCategories: CategoryGroup[] = [
  {
    category: "Коммуникации и Мессенджеры",
    icon: MessageCircle,
    items: [
      { id: "wa", name: "WhatsApp Business API", desc: "Официальный Cloud API для диалогов и AI-ботов", connected: true, isNative: true },
      { id: "tg", name: "Telegram Bot API", desc: "Уведомления, боты заказов и рассылки", connected: true, isNative: true },
      { id: "ig", name: "Instagram Direct", desc: "Авто-ответы на сообщения в директ и комментарии", connected: false, isNative: false },
      { id: "fb", name: "Facebook Messenger", desc: "Синхронизация входящих лидов из страницы бренда", connected: false, isNative: false },
      { id: "tt", name: "TikTok Lead Generation", desc: "Автоматический импорт заявок из рекламных лид-форм", connected: false, isNative: false },
      { id: "th", name: "Threads Social CRM", desc: "Мониторинг упоминаний бренда и ответы клиентам", connected: false, isNative: false },
      { id: "em", name: "Корпоративный Email", desc: "IMAP/SMTP интеграция писем со сделками", connected: true, isNative: true },
      { id: "wc", name: "WebChat Виджет", desc: "Онлайн-чат на сайте с поддержкой AI ассистента", connected: true, isNative: true },
    ],
  },
  {
    category: "Платежные системы & Банкинг",
    icon: CreditCard,
    items: [
      { id: "kaspi", name: "Kaspi Pay Business", desc: "Выставление счетов в Kaspi и прием оплат QR / удаленно", connected: true, isNative: true },
      { id: "stripe", name: "Stripe Payments", desc: "Международный прием платежей по картам Visa / Master", connected: false, isNative: false },
      { id: "paypal", name: "PayPal Checkout", desc: "Платежи зарубежных контрагентов", connected: false, isNative: false },
    ],
  },
  {
    category: "Календари & Встречи",
    icon: Calendar,
    items: [
      { id: "native_meet", name: "Встроенные встречи Nexus", desc: "Нативный модуль расписания без сторонних сервисов", connected: true, isNative: true },
      { id: "gcal", name: "Google Calendar", desc: "Двусторонняя синхронизация встреч менеджеров", connected: true, isNative: false },
      { id: "outlook", name: "Outlook Calendar", desc: "Интеграция с корпоративным расписанием Microsoft", connected: false, isNative: false },
    ],
  },
  {
    category: "Телефония & Звонки",
    icon: Phone,
    items: [
      { id: "webrtc", name: "Встроенная WebRTC телефония", desc: "Звонки прямо из браузера без подключения SIP-провайдера", connected: true, isNative: true },
      { id: "zadarma", name: "Zadarma Cloud PBX", desc: "Подключение виртуальных номеров и запись разговоров", connected: false, isNative: false },
      { id: "sipnet", name: "SIPNET Телефония", desc: "Многоканальные корпоративные SIP-транки", connected: false, isNative: false },
    ],
  },
  {
    category: "Облачные хранилища",
    icon: HardDrive,
    items: [
      { id: "local", name: "Локальное безопасное хранилище", desc: "Нативное шифрованное файловое хранилище Nexus", connected: true, isNative: true },
      { id: "gdrive", name: "Google Drive", desc: "Авто-сохранение договоров и коммерческих предложений", connected: false, isNative: false },
      { id: "dropbox", name: "Dropbox Business", desc: "Синхронизация тяжелых медиафайлов и архивов", connected: false, isNative: false },
    ],
  },
  {
    category: "Маркетинг & Сквозная Аналитика",
    icon: BarChart,
    items: [
      { id: "utm", name: "Встроенный UTM Tracking", desc: "Сквозной трекинг источников, меток и ROMI в CRM", connected: true, isNative: true },
      { id: "ga4", name: "Google Analytics 4", desc: "Синхронизация оффлайн-конверсий с веб-аналитикой", connected: false, isNative: false },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <span>Центр Интеграций & API</span>
            <Badge variant="default" className="text-xs font-mono py-0.5">
              Native First · Dual-Direction
            </Badge>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Каждая функция работает нативно из коробки. Внешние сервисы подключаются как опциональные адаптеры.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Key className="h-3.5 w-3.5" />
            <span>API Ключи (Webhook)</span>
          </Button>
          <Button size="sm" className="gap-2 text-xs font-medium">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Документация REST API</span>
          </Button>
        </div>
      </div>

      {/* Principle Banner: Dual Direction Architecture */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-200 bg-indigo-50/60 dark:border-indigo-500/20 dark:bg-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 shrink-0">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Двусторонняя архитектура (Two-Way Integration Bridge)
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300/90 mt-0.5 leading-relaxed">
              Внешние системы могут вызывать Nexus CRM через открытый <strong>REST API & Webhooks</strong>, а наша CRM может автоматически отправлять события и вызывать вебхуки сторонних сервисов (Kaspi, 1C, Google, WhatsApp).
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-xs shrink-0 self-start sm:self-center">
          OpenAPI 3.1 Ready
        </Badge>
      </div>

      {/* Categories Grid */}
      <div className="space-y-6">
        {integrationCategories.map((cat) => {
          const CategoryIcon = cat.icon;
          return (
            <div key={cat.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
                  {cat.category}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.items.map((item) => (
                  <Card
                    key={item.id}
                    className={`transition-all ${
                      item.connected
                        ? "border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10"
                        : "hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.isNative && (
                              <span className="text-[10px] font-mono font-normal text-indigo-600 dark:text-indigo-400">
                                [Native]
                              </span>
                            )}
                          </h4>
                          {item.connected ? (
                            <Badge variant="success" className="text-[10px] gap-1 py-0 px-2">
                              <CheckCircle2 className="h-3 w-3" />
                              Активно
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-zinc-500 py-0 px-2">
                              Опционально
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                          {item.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.05] flex justify-end">
                        <Button
                          variant={item.connected ? "outline" : "default"}
                          size="sm"
                          className="h-7 text-xs px-3"
                        >
                          {item.connected ? "Настройки" : "Подключить"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
