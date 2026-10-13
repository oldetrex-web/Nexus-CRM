"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  Globe,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Company } from "@/lib/types";
import api from "@/lib/api";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [formName, setFormName] = useState("");
  const [formBin, setFormBin] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formIndustry, setFormIndustry] = useState("");
  const [formType, setFormType] = useState("customer");
  const [submitting, setSubmitting] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/companies");
      setCompanies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Failed to fetch companies", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formName,
        bin_iin: formBin || null,
        phone: formPhone || null,
        industry: formIndustry || null,
        company_type: formType,
      };

      const res = await api.post("/companies", payload);
      if (res.data) {
        setCompanies((prev) => [res.data, ...prev]);
      }
      setDialogOpen(false);
      setFormName("");
      setFormBin("");
      setFormPhone("");
      setFormIndustry("");
    } catch (err) {
      console.error("Error creating company", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.bin_iin?.includes(searchTerm) ||
      c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompanyTypeBadge = (type: string) => {
    switch (type) {
      case "customer":
        return <Badge variant="success">Клиент</Badge>;
      case "partner":
        return <Badge variant="default">Партнер</Badge>;
      case "vendor":
        return <Badge variant="secondary">Поставщик</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Компании и Контрагенты</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              Live DB
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Юридические лица, БИН/ИИН, связанные сделки и история договоров
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCompanies}
            disabled={loading}
            className="h-10 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Обновить</span>
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="gap-2 w-full sm:w-auto h-10">
            <Plus className="h-4 w-4" />
            <span>Добавить компанию</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск по названию, БИН, отрасли..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-7 w-7 text-slate-400 animate-spin" />
              <p className="text-sm text-slate-500">Загрузка компаний...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-zinc-800">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700 dark:text-zinc-200">
                  {searchTerm ? "Компании не найдены" : "Список компаний пуст"}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchTerm
                    ? "Попробуйте изменить поисковый запрос"
                    : "Нажмите «Добавить компанию», чтобы добавить первую"}
                </p>
              </div>
              {!searchTerm && (
                <Button onClick={() => setDialogOpen(true)} className="gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Добавить компанию
                </Button>
              )}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-slate-600 dark:text-zinc-400">Компания</TableHead>
                <TableHead className="text-slate-600 dark:text-zinc-400">БИН / ИИН</TableHead>
                <TableHead className="hidden md:table-cell text-slate-600 dark:text-zinc-400">Телефон</TableHead>
                <TableHead className="hidden lg:table-cell text-slate-600 dark:text-zinc-400">Отрасль</TableHead>
                <TableHead className="text-slate-600 dark:text-zinc-400">Тип</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((company) => (
                <TableRow key={company.id} className="group border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-zinc-800/60">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block truncate">
                          {company.name}
                        </span>
                        {company.website && (
                          <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {company.website.replace("https://", "")}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-zinc-300">
                    {company.bin_iin || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs font-mono text-slate-600 dark:text-zinc-300">
                    {company.phone || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-slate-600 dark:text-zinc-300">
                    {company.industry || "—"}
                  </TableCell>
                  <TableCell>{getCompanyTypeBadge(company.company_type)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* DIALOG: CREATE COMPANY */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-zinc-100 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-zinc-100">Добавить компанию</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Создание юридического лица в базе данных бэкенда
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCompany} className="space-y-3 mt-2">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-700 dark:text-zinc-300">Название компании *</label>
              <Input
                required
                placeholder="ТОО «KazAgro»"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-700 dark:text-zinc-300">БИН / ИИН</label>
                <Input
                  placeholder="210440019283"
                  value={formBin}
                  onChange={(e) => setFormBin(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-700 dark:text-zinc-300">Телефон</label>
                <Input
                  placeholder="+7 (727) 000-00-00"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-700 dark:text-zinc-300">Отрасль</label>
                <Input
                  placeholder="IT & Digital"
                  value={formIndustry}
                  onChange={(e) => setFormIndustry(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-700 dark:text-zinc-300">Тип контрагента</label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-2 text-xs text-slate-900 dark:text-zinc-100"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                >
                  <option value="customer">Клиент</option>
                  <option value="partner">Партнер</option>
                  <option value="vendor">Поставщик</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
