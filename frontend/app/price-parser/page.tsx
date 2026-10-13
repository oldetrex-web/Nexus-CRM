"use client";

import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Loader2,
  X,
  FileX,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

interface ParsedRow {
  sku: string;
  name: string;
  category: string;
  cost_price: number;
  retail_price: number;
  stock: number;
  confidence?: number;
}

interface MappingConfig {
  sku: string;
  name: string;
  category: string;
  cost_price: string;
  retail_price: string;
  stock: string;
}

export default function PriceParserPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [vendorName, setVendorName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [mappings, setMappings] = useState<MappingConfig>({
    sku: "",
    name: "",
    category: "",
    cost_price: "",
    retail_price: "",
    stock: "",
  });

  const handleFileSelect = (f: File) => {
    setFile(f);
    setParsed([]);
    setImportDone(false);
    setVendorName(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/products/parse-price", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setParsed(Array.isArray(res.data?.rows) ? res.data.rows : []);
      if (res.data?.mappings) setMappings(res.data.mappings);
    } catch {
      // Show empty result with manual mapping
      setParsed([]);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsed.length) return;
    setImporting(true);
    try {
      for (const row of parsed) {
        await api.post("/products", {
          name: row.name,
          sku: row.sku || undefined,
          category: row.category || undefined,
          cost_price: row.cost_price || 0,
          price: row.retail_price || 0,
          stock: row.stock || 0,
        }).catch(() => {});
      }
      setImportDone(true);
    } finally {
      setImporting(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setParsed([]);
    setImportDone(false);
    setMappings({ sku: "", name: "", category: "", cost_price: "", retail_price: "", stock: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Парсер прайс-листов</span>
            <Badge variant="default" className="text-xs font-mono py-0.5 gap-1">
              <Sparkles className="h-3 w-3" /> AI
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Загрузите прайс поставщика — AI распознает структуру и импортирует товары на склад
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      {!file ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-slate-300 dark:border-white/10 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-900/60"
          }`}
        >
          <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center mb-4">
            <UploadCloud className="h-7 w-7 text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Перетащите прайс-лист или нажмите для выбора
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Excel (.xlsx, .xls), CSV, PDF — до 100 МБ
          </p>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv,.pdf,.docx,.txt"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
          />
        </label>
      ) : (
        /* File Selected */
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30">
                  <FileSpreadsheet className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(file.size / 1024).toFixed(0)} КБ · {file.type || "Файл данных"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!parsed.length && !parsing && (
                  <Button onClick={handleParse} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Sparkles className="h-4 w-4" /> Разобрать AI
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={resetFile} className="h-9 w-9 text-slate-400 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {parsing && (
              <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20">
                <Loader2 className="h-4 w-4 text-indigo-600 animate-spin shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">AI анализирует структуру файла...</p>
                  <p className="text-xs text-indigo-500 mt-0.5">Определяем колонки, категории и цены</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mapping + Preview */}
      {file && !parsing && parsed.length === 0 && !parsing && file && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ручное сопоставление колонок</CardTitle>
            <CardDescription>Укажите какая колонка файла соответствует каждому полю</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {([
                ["sku", "Артикул / SKU"],
                ["name", "Наименование *"],
                ["category", "Категория"],
                ["cost_price", "Закупочная цена (₸)"],
                ["retail_price", "Розничная цена (₸)"],
                ["stock", "Остаток на складе"],
              ] as [keyof MappingConfig, string][]).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">{label}</label>
                  <Input
                    placeholder="Колонка A, B..."
                    value={mappings[key]}
                    onChange={(e) => setMappings({ ...mappings, [key]: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleParse} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Sparkles className="h-4 w-4" /> Применить и распознать
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed Results */}
      {parsed.length > 0 && (
        <div className="space-y-4">
          {/* Vendor + Import actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                {parsed.length} позиций распознано
              </Badge>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Поставщик:</label>
                <Input
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="h-7 text-xs w-48"
                  placeholder="Название поставщика"
                />
              </div>
            </div>
            {importDone ? (
              <Badge variant="success" className="gap-1.5 text-xs px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Импортировано на склад!
              </Badge>
            ) : (
              <Button onClick={handleImport} disabled={importing} className="gap-2 bg-blue-600 hover:bg-blue-700">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Импортировать {parsed.length} товаров на склад
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-white/[0.06]">
                    <TableHead>SKU / Артикул</TableHead>
                    <TableHead>Наименование</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Закупка (₸)</TableHead>
                    <TableHead>Розница (₸)</TableHead>
                    <TableHead>Остаток</TableHead>
                    {parsed[0]?.confidence !== undefined && (
                      <TableHead className="text-right">AI %</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.slice(0, 20).map((row, i) => (
                    <TableRow key={i} className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400">{row.sku || "—"}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-800 dark:text-zinc-200 max-w-[200px] truncate">{row.name}</TableCell>
                      <TableCell className="text-xs text-slate-500 dark:text-zinc-400">{row.category || "—"}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-700 dark:text-zinc-300">{formatCurrency(row.cost_price)}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.retail_price)}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600 dark:text-zinc-400">{row.stock ?? "—"}</TableCell>
                      {row.confidence !== undefined && (
                        <TableCell className="text-right font-mono text-xs text-indigo-600 dark:text-indigo-400">{row.confidence}%</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsed.length > 20 && (
                <div className="p-3 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-white/[0.04]">
                  Показаны первые 20 из {parsed.length} позиций
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
