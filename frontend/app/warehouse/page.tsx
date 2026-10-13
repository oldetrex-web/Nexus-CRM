"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  DollarSign,
  Layers,
  Filter,
  CheckCircle2,
  RotateCcw,
  ArrowRightLeft,
  RefreshCw,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input as FormInput } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

interface WarehouseProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  reserved: number;
  unit: string;
}

export default function WarehousePage() {
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("0");
  const [formUnit, setFormUnit] = useState("шт");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;
    setSubmitting(true);
    try {
      const res = await api.post("/products", {
        sku: formSku || null,
        name: formName,
        category: formCategory || null,
        price: parseFloat(formPrice) || 0,
        stock: parseInt(formStock) || 0,
        unit: formUnit,
      });
      if (res.data) setProducts((prev) => [res.data, ...prev]);
      setDialogOpen(false);
      setFormSku(""); setFormName(""); setFormCategory("");
      setFormPrice(""); setFormStock("0");
    } catch (err) {
      console.error("Error creating product", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockItems = products.filter((p) => p.stock - (p.reserved || 0) < 5);
  const reservedTotal = products.reduce((sum, p) => sum + (p.reserved || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span>Склад & Номенклатура</span>
            <Badge variant="default" className="text-xs font-mono py-0.5">
              Deal-Bridge
            </Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {loading
              ? "Загрузка номенклатуры..."
              : products.length === 0
              ? "Склад пуст — добавьте первые товары или услуги"
              : `${products.length} позиций в каталоге`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={loading}
            className="h-10 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Обновить</span>
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="gap-2 h-10">
            <Plus className="h-4 w-4" />
            <span>Добавить товар</span>
          </Button>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Всего позиций</span>
            <Package className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {loading ? "—" : products.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">активных SKU в каталоге</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Стоимость остатков</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {loading ? "—" : totalValue > 0 ? formatCurrency(totalValue) : "0 ₸"}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">в закупочных ценах</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Заканчивается</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {loading ? "—" : lowStockItems.length}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400/80 mt-1">
              {lowStockItems.length > 0 ? "требуют пополнения" : "всё в норме"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">В резерве сделок</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {loading ? "—" : `${reservedTotal} шт`}
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">авто-заблокировано в CRM</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10">
          <TabsTrigger value="inventory">Каталог остатков ({products.length})</TabsTrigger>
          <TabsTrigger value="bridge" className="gap-2">
            <ArrowRightLeft className="h-3.5 w-3.5 text-indigo-500" />
            <span>CRM ↔ Склад Мост</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Inventory */}
        <TabsContent value="inventory" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Поиск по SKU, названию, категории..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-sm"
            />
          </div>

          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <RefreshCw className="h-7 w-7 text-slate-400 animate-spin" />
                  <p className="text-sm text-slate-500">Загрузка каталога...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="p-4 rounded-full bg-slate-100 dark:bg-zinc-800">
                    <PackageOpen className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-700 dark:text-zinc-200">
                      {searchTerm ? "Товары не найдены" : "Склад пуст"}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {searchTerm
                        ? "Попробуйте другой запрос"
                        : "Добавьте первые товары, услуги или материалы в каталог"}
                    </p>
                  </div>
                  {!searchTerm && (
                    <Button onClick={() => setDialogOpen(true)} className="gap-2" size="sm">
                      <Plus className="h-4 w-4" />
                      Добавить позицию
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 dark:border-white/[0.06] hover:bg-transparent">
                      <TableHead className="text-slate-600 dark:text-zinc-400">SKU Артикул</TableHead>
                      <TableHead className="text-slate-600 dark:text-zinc-400">Наименование</TableHead>
                      <TableHead className="hidden md:table-cell text-slate-600 dark:text-zinc-400">Категория</TableHead>
                      <TableHead className="text-slate-600 dark:text-zinc-400">Цена</TableHead>
                      <TableHead className="text-slate-600 dark:text-zinc-400">Остаток / Резерв</TableHead>
                      <TableHead className="text-right text-slate-600 dark:text-zinc-400">Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => {
                      const available = item.stock - (item.reserved || 0);
                      const isLow = available < 5;
                      return (
                        <TableRow key={item.id} className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-zinc-800/60">
                          <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            {item.sku || "—"}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 dark:text-zinc-200 max-w-[240px] truncate">
                            {item.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-slate-500 dark:text-zinc-400">
                            {item.category || "—"}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-slate-800 dark:text-zinc-200">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="min-w-[150px]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-slate-800 dark:text-zinc-200 font-medium">
                                  {available} {item.unit || "шт"} свободно
                                </span>
                                {(item.reserved || 0) > 0 && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    (резерв: {item.reserved})
                                  </span>
                                )}
                              </div>
                              <Progress
                                value={item.stock > 0 ? Math.min((available / Math.max(item.stock, 1)) * 100, 100) : 0}
                                className="h-1.5"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isLow ? (
                              <Badge variant="warning">Мало</Badge>
                            ) : (
                              <Badge variant="success">В наличии</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: CRM <-> WAREHOUSE BRIDGE */}
        <TabsContent value="bridge" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-950/20 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold text-xs">
                <Layers className="h-4 w-4" />
                <span>Авто-резерв при переговорах</span>
              </div>
              <p className="text-xs text-indigo-900 dark:text-indigo-200/90 leading-relaxed">
                При переводе сделки в этап «Переговоры» указанные товары мгновенно блокируются на складе и не могут быть проданы другим менеджерам.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Авто-списание при закрытии</span>
              </div>
              <p className="text-xs text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                Когда сделка переходит в статус «Успешно» или счёт оплачивается, склад автоматически производит бухгалтерское списание.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                <RotateCcw className="h-4 w-4" />
                <span>Авто-возврат при проигрыше</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                Если сделка переводится в «Проиграно» или отменяется, резерв немедленно освобождается и возвращается в доступный остаток.
              </p>
            </div>
          </div>

          {/* Bridge Event Log — Empty State */}
          <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Журнал синхронизаций Deal ↔ Склад</span>
                <span className="text-xs text-slate-400 font-normal">Real-time Event Stream</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="p-3 rounded-full bg-slate-100 dark:bg-zinc-800">
                  <ArrowRightLeft className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-zinc-300">
                  Событий синхронизации пока нет
                </p>
                <p className="text-xs text-slate-400 text-center max-w-sm">
                  Здесь будут отображаться авто-резервы, списания и возвраты товаров при изменении статусов сделок
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG: ADD PRODUCT */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Добавить товар / услугу</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Позиция сохраняется в каталог и становится доступной для привязки к сделкам
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">SKU Артикул</label>
                <FormInput placeholder="NX-SRV-01" value={formSku} onChange={(e) => setFormSku(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Категория</label>
                <FormInput placeholder="Оборудование" value={formCategory} onChange={(e) => setFormCategory(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Наименование *</label>
              <FormInput required placeholder="Серверный модуль Pro" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 col-span-2">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Цена (₸)</label>
                <FormInput type="number" placeholder="100000" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Ед. изм.</label>
                <FormInput placeholder="шт" value={formUnit} onChange={(e) => setFormUnit(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Начальный остаток</label>
              <FormInput type="number" placeholder="0" value={formStock} onChange={(e) => setFormStock(e.target.value)} />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Отмена</Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Сохранение..." : "Добавить в каталог"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
