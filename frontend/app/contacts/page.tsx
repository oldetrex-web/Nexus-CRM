"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Contact } from "@/lib/types";
import api from "@/lib/api";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    position: "",
    status: "lead",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/contacts");
      setContacts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Failed to fetch contacts", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name) return;

    setSubmitting(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name || null,
        phone: formData.phone || null,
        email: formData.email || null,
        position: formData.position || null,
        status: formData.status,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await api.post("/contacts", payload);
      if (res.data) {
        setContacts((prev) => [res.data, ...prev]);
      }
      setIsDialogOpen(false);
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        position: "",
        status: "lead",
        tags: "",
      });
    } catch (err) {
      console.error("Error creating contact", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = contacts.filter(
    (c) =>
      `${c.first_name} ${c.last_name || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vip":
        return <Badge variant="default">⭐ VIP</Badge>;
      case "active":
        return <Badge variant="success">Активный</Badge>;
      case "lead":
        return <Badge variant="warning">Новый лид</Badge>;
      case "churned":
        return <Badge variant="destructive">Утерян</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Клиенты и Контакты</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
              Live DB
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {loading
              ? "Загрузка из базы данных..."
              : contacts.length === 0
              ? "Контактов пока нет — добавьте первый"
              : `${contacts.length} контакт${contacts.length === 1 ? "" : contacts.length < 5 ? "а" : "ов"} в базе`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContacts}
            disabled={loading}
            className="h-10 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Синхронизировать</span>
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 w-full sm:w-auto h-10">
            <Plus className="h-4 w-4" />
            <span>Новый контакт</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Поиск по имени, телефону, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-sm"
        />
      </div>

      {/* Contacts Table */}
      <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-7 w-7 text-slate-400 animate-spin" />
              <p className="text-sm text-slate-500">Загрузка контактов...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-zinc-800">
                <UserPlus className="h-8 w-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-700 dark:text-zinc-200">
                  {searchTerm ? "Контакты не найдены" : "Список контактов пуст"}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchTerm
                    ? "Попробуйте изменить поисковый запрос"
                    : "Нажмите «Новый контакт», чтобы добавить первого клиента"}
                </p>
              </div>
              {!searchTerm && (
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Добавить контакт
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-slate-600 dark:text-zinc-400">Контакт</TableHead>
                  <TableHead className="hidden sm:table-cell text-slate-600 dark:text-zinc-400">Телефон</TableHead>
                  <TableHead className="hidden md:table-cell text-slate-600 dark:text-zinc-400">Email</TableHead>
                  <TableHead className="text-slate-600 dark:text-zinc-400">Статус</TableHead>
                  <TableHead className="hidden lg:table-cell text-slate-600 dark:text-zinc-400">Теги</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-zinc-400">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contact) => (
                  <TableRow key={contact.id} className="group border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50 dark:hover:bg-zinc-800/60">
                    <TableCell>
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="flex items-center gap-3 hover:opacity-90"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200">
                            {contact.first_name[0]}
                            {contact.last_name ? contact.last_name[0] : ""}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {contact.first_name} {contact.last_name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                            {contact.company_id || "Частное лицо"}
                            {contact.position ? ` · ${contact.position}` : ""}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs font-mono text-slate-600 dark:text-zinc-300">
                      {contact.phone || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-slate-600 dark:text-zinc-300">
                      {contact.email || "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] py-0 px-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/contacts/${contact.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-white"
                        >
                          <span>360°</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* DIALOG: CREATE NEW CONTACT */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-zinc-100">Добавить контакт</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Данные будут сохранены в базу данных бэкенда
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateContact} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Имя *</label>
                <Input
                  required
                  placeholder="Иван"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Фамилия</label>
                <Input
                  placeholder="Смирнов"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Телефон</label>
              <Input
                placeholder="+7 (777) 000-00-00"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Email</label>
              <Input
                type="email"
                placeholder="client@company.kz"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Должность</label>
                <Input
                  placeholder="Директор"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Статус</label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="lead">Новый лид</option>
                  <option value="active">Активный</option>
                  <option value="vip">VIP</option>
                  <option value="churned">Утерян</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Теги (через запятую)</label>
              <Input
                placeholder="B2B, Срочно"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Сохранение..." : "Сохранить в БД"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
