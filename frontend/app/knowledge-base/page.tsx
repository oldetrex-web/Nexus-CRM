"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  Database,
  Sparkles,
  CheckCircle2,
  Trash2,
  Cpu,
  Layers,
  Wrench,
  Bot,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface KnowledgeDoc {
  id: string;
  name: string;
  category: string;
  chunks: number;
  tokens: string;
  vectorStatus: "indexed" | "processing";
  updatedAt: string;
}

const mockKnowledgeDocs: KnowledgeDoc[] = [
  {
    id: "k-1",
    name: "Регламент работы отдела продаж Nexus 2026.pdf",
    category: "Продажи",
    chunks: 142,
    tokens: "48,200",
    vectorStatus: "indexed",
    updatedAt: "Вчера в 16:30",
  },
  {
    id: "k-2",
    name: "Технические спецификации оборудования и прайсы.docx",
    category: "Каталог & Склад",
    chunks: 89,
    tokens: "31,500",
    vectorStatus: "indexed",
    updatedAt: "10 Окт 11:20",
  },
  {
    id: "k-3",
    name: "Часто задаваемые вопросы клиентов (FAQ) по доставке и возвратам.md",
    category: "Поддержка",
    chunks: 35,
    tokens: "12,100",
    vectorStatus: "indexed",
    updatedAt: "08 Окт 09:45",
  },
  {
    id: "k-4",
    name: "Юридические шаблоны договоров и типовые оговорки.pdf",
    category: "Юриспруденция",
    chunks: 64,
    tokens: "22,400",
    vectorStatus: "indexed",
    updatedAt: "05 Окт 18:00",
  },
];

const mockToolsRegistry = [
  {
    name: "crm.create_deal",
    description: "Создает новую сделку в CRM с привязкой к клиенту и сумме",
    category: "CRM Core",
    enabled: true,
  },
  {
    name: "warehouse.reserve_stock",
    description: "Резервирует товар на складе при переходе в стадию переговоров",
    category: "Склад",
    enabled: true,
  },
  {
    name: "warehouse.deduct_stock",
    description: "Производит бухгалтерское списание при закрытии или оплате счета",
    category: "Склад",
    enabled: true,
  },
  {
    name: "documents.generate_pdf_invoice",
    description: "Генерирует PDF-счет с QR-кодом Kaspi Pay и отправляет клиенту",
    category: "Документы",
    enabled: true,
  },
  {
    name: "channels.send_message",
    description: "Отправляет сообщение в выбранный канал (WhatsApp, TG, Instagram)",
    category: "Коммуникации",
    enabled: true,
  },
];

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [testQuery, setTestQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSemanticSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearchResult(
        `Найдено 3 релевантных фрагмента (FAISS Vector Cosine Similarity: 0.94):\n\n1. "Согласно регламенту, при заказе от 500 000 ₸ клиенту автоматически предоставляется скидка 7% и бесплатная доставка по г. Алматы и г. Астана курьерской службой..."\n\n2. "Срок резервирования оборудования составляет не более 5 рабочих дней до момента внесения предоплаты."`
      );
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <span>База знаний & Векторный RAG</span>
            <Badge variant="default" className="text-xs font-mono py-0.5">
              FAISS Index Active
            </Badge>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Семантический векторный поиск для AI-агентов и реестр исполняемых инструментов (Tool Registry)
          </p>
        </div>
        <Button size="sm" className="gap-2 text-xs font-medium">
          <Upload className="h-4 w-4" />
          <span>Загрузить документ (PDF/DOCX)</span>
        </Button>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Векторная база (FAISS)</span>
            <Database className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">330 chunks</div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">114,200 токенов проиндексировано</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Документов в RAG</span>
            <FileText className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">4 файла</div>
            <p className="text-xs text-zinc-500 mt-1">100% статус готовности</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tool Registry (Инструменты)</span>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">5 методов</div>
            <p className="text-xs text-zinc-500 mt-1">доступны AI Sales & Support</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Embedding Модель</span>
            <Cpu className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">text-emb-3</div>
            <p className="text-xs text-zinc-500 mt-1">1536-мерные эмбеддинги</p>
          </CardContent>
        </Card>
      </div>

      {/* Semantic Search Simulator */}
      <Card className="border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-indigo-50/20 to-white dark:from-indigo-950/15 dark:to-[#121215]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <CardTitle className="text-sm">Тестирование семантического RAG-поиска</CardTitle>
          </div>
          <p className="text-xs text-zinc-500">
            Проверьте, какие фрагменты документов извлекает AI при вопросе клиента
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleSemanticSearch} className="flex gap-2">
            <Input
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Например: Каковы условия бесплатной доставки и скидки от объема?"
              className="text-xs"
            />
            <Button type="submit" size="sm" disabled={isSearching} className="text-xs shrink-0">
              {isSearching ? "Поиск..." : "Запустить RAG"}
            </Button>
          </form>

          {searchResult && (
            <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed">
              {searchResult}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs: Documents & Tool Registry */}
      <Tabs defaultValue="docs" className="w-full">
        <TabsList className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <TabsTrigger value="docs">Индексированные документы ({mockKnowledgeDocs.length})</TabsTrigger>
          <TabsTrigger value="tools">Tool Registry ({mockToolsRegistry.length} инструментов)</TabsTrigger>
        </TabsList>

        {/* TAB 1: Documents */}
        <TabsContent value="docs" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-white/[0.06] hover:bg-transparent">
                    <TableHead>Файл документа</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Чанки (FAISS)</TableHead>
                    <TableHead>Токены</TableHead>
                    <TableHead>Статус векторизации</TableHead>
                    <TableHead className="text-right">Обновлено</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockKnowledgeDocs.map((doc) => (
                    <TableRow key={doc.id} className="border-b border-zinc-100 dark:border-white/[0.04]">
                      <TableCell className="font-medium text-xs text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-[320px]">{doc.name}</span>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                        {doc.category}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                        {doc.chunks}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                        {doc.tokens}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="gap-1 text-[10px]">
                          <CheckCircle2 className="h-3 w-3" />
                          Синхронизировано
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[11px] text-zinc-500 font-mono">
                        {doc.updatedAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Tools Registry */}
        <TabsContent value="tools" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-white/[0.06] hover:bg-transparent">
                    <TableHead>Имя функции (Function Call)</TableHead>
                    <TableHead>Описание действия</TableHead>
                    <TableHead>Модуль ядра</TableHead>
                    <TableHead className="text-right">Статус доступа</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockToolsRegistry.map((tool, idx) => (
                    <TableRow key={idx} className="border-b border-zinc-100 dark:border-white/[0.04]">
                      <TableCell className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {tool.name}()
                      </TableCell>
                      <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">
                        {tool.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {tool.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success" className="text-[10px]">
                          Разрешено AI
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
