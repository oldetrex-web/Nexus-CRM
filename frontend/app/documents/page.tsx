"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Download,
  Eye,
  Search,
  Clock,
  FileCheck,
  Send,
  DollarSign,
  RefreshCw,
  FilePlus,
  FileX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

interface DocumentItem {
  id: string;
  number: string;
  title: string;
  client: string;
  type: "contract" | "proposal" | "act" | "invoice";
  amount: number;
  status: "draft" | "review" | "signed" | "paid";
  date: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/documents");
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "contract": return "Договор";
      case "proposal": return "КП";
      case "act": return "Акт";
      case "invoice": return "Счет";
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="outline">Черновик</Badge>;
      case "review": return <Badge variant="warning">На согласовании</Badge>;
      case "signed": return <Badge variant="default">Подписан</Badge>;
      case "paid": return <Badge variant="success">Оплачен</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filtered = documents.filter((doc) => {
    const matchSearch =
      doc.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "all" || doc.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPaid = documents.filter((d) => d.status === "paid").reduce((s, d) => s + (d.amount || 0), 0);
  const pendingCount = documents.filter((d) => d.status === "review").length;
  const signedCount = documents.filter((d) => d.status === "signed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Документы & Счета</span>
            <Badge variant="default" className="text-xs font-mono py-0.5">PDF Engine</Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {loading ? "Загрузка..." : documents.length === 0
              ? "Документов пока нет — создайте первый счёт или договор"
              : `${documents.length} документов в базе`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={loading} className="h-9 text-xs gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" className="gap-2 h-9">
            <Plus className="h-4 w-4" />
            <span>Создать документ</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Всего документов</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{loading ? "—" : documents.length}</div>
            <p className="text-xs text-slate-500 mt-1">в базе</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Оплачено по счетам</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {loading ? "—" : totalPaid > 0 ? formatCurrency(totalPaid) : "0 ₸"}
            </div>
            <p className="text-xs text-slate-500 mt-1">подтверждённые платежи</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">На согласовании</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{loading ? "—" : pendingCount}</div>
            <p className="text-xs text-slate-500 mt-1">ожидают подписи</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Подписано</span>
            <FileCheck className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">{loading ? "—" : signedCount}</div>
            <p className="text-xs text-slate-500 mt-1">действующих контрактов</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Поиск по номеру, названию, клиенту..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "contract", "proposal", "act", "invoice"].map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(t)}
              className="text-xs shrink-0"
            >
              {t === "all" ? "Все типы" : getTypeLabel(t)}
            </Button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-7 w-7 text-slate-400 animate-spin" />
              <p className="text-sm text-slate-500">Загрузка документов...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-zinc-800">
                <FileX className="h-8 w-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700 dark:text-zinc-200">
                  {searchTerm ? "Документы не найдены" : "Документов пока нет"}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchTerm
                    ? "Попробуйте изменить фильтр"
                    : "Создайте первый счёт, КП или договор — они появятся здесь"}
                </p>
              </div>
              {!searchTerm && (
                <Button size="sm" className="gap-2">
                  <FilePlus className="h-4 w-4" />
                  Создать первый документ
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead>Номер</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id} className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                    <TableCell className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">{doc.number}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px] py-0">{getTypeLabel(doc.type)}</Badge></TableCell>
                    <TableCell className="text-xs text-slate-800 dark:text-zinc-200 max-w-[240px] truncate font-medium">{doc.title}</TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-zinc-400">{doc.client}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">{formatCurrency(doc.amount)}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-900"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-900"><Download className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-500"><Send className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
