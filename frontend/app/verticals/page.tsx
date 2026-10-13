"use client";

import React, { useState } from "react";
import {
  Layers,
  Wrench,
  Sparkles,
  Scissors,
  Car,
  ShoppingCart,
  HardHat,
  CheckCircle2,
  Sliders,
  FileText,
  Bot,
  Plus,
  Save,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface VerticalConfig {
  id: string;
  name: string;
  icon: any;
  tagline: string;
  customFields: { name: string; type: string; placeholder: string; required: boolean }[];
  pipelineStages: string[];
  documents: string[];
  aiSystemPrompt: string;
}

const verticalsData: VerticalConfig[] = [
  {
    id: "auto",
    name: "Автосервис & СТО",
    icon: Car,
    tagline: "Спецификация для автосервисов, тюнинг-ателье и автомоечных комплексов",
    customFields: [
      { name: "VIN-код кузова", type: "text", placeholder: "WDB2110061A...", required: true },
      { name: "Госномер авто", type: "text", placeholder: "777 KZ 02", required: true },
      { name: "Марка и Модель", type: "text", placeholder: "Toyota Camry 70 / 2.5L", required: true },
      { name: "Текущий пробег (км)", type: "number", placeholder: "142000", required: false },
      { name: "Назначенный мастер-приёмщик", type: "select", placeholder: "Выберите мастера", required: true },
    ],
    pipelineStages: [
      "Запись на диагностику",
      "Осмотр и дефектовка",
      "Согласование сметы запчастей",
      "В работе на подъемнике",
      "Контроль качества (ОТК)",
      "Готов к выдаче & Оплата",
    ],
    documents: [
      "Заказ-наряд на ремонт авто",
      "Акт дефектовки узлов и агрегатов",
      "Гарантийный талон на запчасти",
      "Счет-фактура и фискальный чек",
    ],
    aiSystemPrompt:
      "Ты — AI-мастер-консультант СТО 'Nexus Auto'. При обращении клиента сразу запрашивай симптомы поломки, марку/модель авто и госномер. Рассчитывай предварительную стоимость нормо-часа и сразу бронируй свободный подъемник в графике.",
  },
  {
    id: "beauty",
    name: "Салон красоты & SPA",
    icon: Scissors,
    tagline: "Отраслевой шаблон для барбершопов, косметологий и nail-студий",
    customFields: [
      { name: "Ведущий стилист / косметолог", type: "select", placeholder: "Айгерим (Топ-мастер)", required: true },
      { name: "Тип процедуры", type: "text", placeholder: "Сложное окрашивание AirTouch", required: true },
      { name: "Длительность сеанса (мин)", type: "number", placeholder: "120", required: true },
      { name: "Аллергии и противопоказания", type: "text", placeholder: "Чувствительная кожа головы", required: false },
    ],
    pipelineStages: [
      "Онлайн-запись (Instagram/WhatsApp)",
      "Подтверждение времени",
      "Визит подтвержден",
      "Услуга оказывается",
      "Завершен (Довольный клиент)",
      "Повторный визит (через 3 недели)",
    ],
    documents: [
      "Карта клиента и информированное согласие",
      "Чек на косметические услуги",
      "Сертификат на повторный визит",
    ],
    aiSystemPrompt:
      "Ты — заботливый AI-администратор премиального салона красоты. Отвечай вежливо, предлагай чай/кофе, помогай выбрать удобный слот к любимому мастеру и отправляй напоминание за 3 часа до визита.",
  },
  {
    id: "construction",
    name: "Строительство & Ремонт",
    icon: HardHat,
    tagline: "Воронка для девелоперов, генподрядчиков и ремонтных бригад",
    customFields: [
      { name: "Адрес объекта / ЖК", type: "text", placeholder: "ЖК 'Highvill Astana', блок C, кв. 142", required: true },
      { name: "Площадь объекта (м²)", type: "number", placeholder: "120", required: true },
      { name: "Номер сметы (КС-2 / КС-3)", type: "text", placeholder: "СМ-2026/89", required: true },
      { name: "Ответственный прораб", type: "select", placeholder: "Серикбаев Нурлан", required: true },
    ],
    pipelineStages: [
      "Заявка на замер",
      "Выезд инженера и замер",
      "Расчет строительной сметы",
      "Подписание договора и аванс",
      "Черновые работы",
      "Чистовая отделка & Сдача КС-2",
    ],
    documents: [
      "Договор строительного подряда",
      "Смета расходов на материалы (КС-2)",
      "Справка о стоимости работ (КС-3)",
      "Акт скрытых работ",
    ],
    aiSystemPrompt:
      "Ты — AI-инженер строительной компании. Твоя задача — выяснять квадратуру, тип ремонта (черновой/чистовой/дизайн) и сразу назначать замерщика на объект, выгружая предварительный расчет стоимости за м².",
  },
  {
    id: "ecommerce",
    name: "E-Commerce & Ритейл",
    icon: ShoppingCart,
    tagline: "Интеграции для онлайн-магазинов, Kaspi Магазина и маркетплейсов",
    customFields: [
      { name: "Номер заказа маркетплейса", type: "text", placeholder: "KASPI-904812", required: true },
      { name: "Трек-номер доставки", type: "text", placeholder: "CDEK-KZ-88401", required: false },
      { name: "Адрес ПВЗ или курьера", type: "text", placeholder: "г. Алматы, пр. Достык 105", required: true },
      { name: "Метод оплаты", type: "select", placeholder: "Kaspi Pay QR / При получении", required: true },
    ],
    pipelineStages: [
      "Заказ оформлен на сайте",
      "Сборка на складе",
      "Передан курьеру / В доставке",
      "Доставлен покупателю",
      "Успешно оплачен",
      "Возврат / Обмен",
    ],
    documents: [
      "Товарная накладная",
      "Гарантийный талон",
      "Транспортная накладная курьера",
    ],
    aiSystemPrompt:
      "Ты — AI-менеджер интернет-магазина. Моментально проверяй наличие товара на складе через API, подтверждай адрес доставки у клиента и высылай Kaspi QR ссылку на оплату.",
  },
];

export default function VerticalsPage() {
  const [selectedVertical, setSelectedVertical] = useState<string>("auto");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const current = verticalsData.find((v) => v.id === selectedVertical) || verticalsData[0];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <span>Конструктор отраслевых вертикалей</span>
            <Badge variant="default" className="text-xs font-mono py-0.5">
              Multi-Industry Engine
            </Badge>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Каждая индустрия получает свои кастомные поля, этапы воронки, печатные формы и специализированные AI-промпты
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2 text-xs font-medium">
          <Save className="h-4 w-4" />
          <span>{savedSuccess ? "Шаблон применён!" : "Сохранить отрасль"}</span>
        </Button>
      </div>

      {/* 4 Industry Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {verticalsData.map((vert) => {
          const isSelected = selectedVertical === vert.id;
          const Icon = vert.icon;

          return (
            <Card
              key={vert.id}
              onClick={() => setSelectedVertical(vert.id)}
              className={`p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md"
                  : "hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="text-[10px]">
                      Активна
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  {vert.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {vert.tagline}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active Vertical Detailed Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Custom Fields & Pipeline (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custom Fields Card */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-zinc-900 dark:text-white">
                  Кастомные поля индустрии: {current.name}
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Эти поля автоматически появятся в карточке сделки и карточке клиента 360°
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Добавить поле</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {current.customFields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                        {field.name}
                      </span>
                      {field.required && (
                        <span className="text-[10px] text-red-500 font-medium">* Обязательное</span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Пример: {field.placeholder}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] self-start sm:self-auto font-mono">
                    Тип: {field.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pipeline Stages Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-zinc-900 dark:text-white">
                Отраслевая воронка продаж (Канбан-стадии)
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                Автоматически перестраивает доску /deals под специфику {current.name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {current.pipelineStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-[#141417] text-xs flex items-center gap-2 shadow-sm"
                  >
                    <span className="h-5 w-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {stage}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Prompt & Documents (1 col) */}
        <div className="space-y-6">
          {/* Industry AI System Prompt */}
          <Card className="border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-[#121215]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="h-4 w-4" />
                <CardTitle className="text-sm">Отраслевой AI-промпт</CardTitle>
              </div>
              <p className="text-xs text-zinc-500">
                Автономный AI Sales Hunter адаптирует свои ответы под эту специфику
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono">
                {current.aiSystemPrompt}
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                <Sliders className="h-3.5 w-3.5" />
                <span>Редактировать системный промпт</span>
              </Button>
            </CardContent>
          </Card>

          {/* Document Templates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-500" />
                <span>Шаблоны документов индустрии</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {current.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-zinc-200/80 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{doc}</span>
                  <Badge variant="outline" className="text-[10px]">PDF</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
