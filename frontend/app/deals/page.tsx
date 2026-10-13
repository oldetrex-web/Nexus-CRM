"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  DollarSign,
  TrendingUp,
  MoreVertical,
  RefreshCw,
  User,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

interface DealCardItem {
  id: string;
  title: string;
  contact_name?: string;
  company_name?: string;
  contact_id?: string;
  company_id?: string;
  amount: number;
  priority: "high" | "medium" | "low" | string;
  stage?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  count: number;
  totalAmount: number;
  deals: DealCardItem[];
}

interface ContactOption {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company_name?: string;
}

const defaultKanbanTemplate: Column[] = [
  { id: "new", title: "Новый лид", color: "from-blue-500 to-cyan-500", count: 0, totalAmount: 0, deals: [] },
  { id: "qualification", title: "Квалификация", color: "from-indigo-500 to-purple-500", count: 0, totalAmount: 0, deals: [] },
  { id: "proposal", title: "Предложение", color: "from-purple-500 to-pink-500", count: 0, totalAmount: 0, deals: [] },
  { id: "negotiation", title: "Переговоры", color: "from-amber-500 to-orange-500", count: 0, totalAmount: 0, deals: [] },
  { id: "won", title: "Успешно", color: "from-emerald-500 to-teal-500", count: 0, totalAmount: 0, deals: [] },
  { id: "lost", title: "Проиграно", color: "from-gray-500 to-slate-600", count: 0, totalAmount: 0, deals: [] },
];

export default function DealsKanbanPage() {
  const [columns, setColumns] = useState<Column[]>(defaultKanbanTemplate);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("new");

  // Contacts list for linking
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
  const [showContactList, setShowContactList] = useState(false);

  // New Deal form fields
  const [dealTitle, setDealTitle] = useState("");
  const [dealAmount, setDealAmount] = useState("");
  const [dealPriority, setDealPriority] = useState("medium");
  const [dealDescription, setDealDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/deals");
      if (res.data && Array.isArray(res.data)) {
        distributeDealsToColumns(res.data);
      }
    } catch (err) {
      console.warn("Backend API unavailable", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await api.get("/contacts");
      const list = Array.isArray(res.data) ? res.data : [];
      setContacts(
        list.map((c: any) => ({
          id: c.id,
          name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.phone || "Без имени",
          phone: c.phone || undefined,
          email: c.email || undefined,
          company_name: c.company?.name || undefined,
        }))
      );
    } catch {}
  };

  const distributeDealsToColumns = (dealsList: any[], contactsList: ContactOption[] = contacts) => {
    const updated = defaultKanbanTemplate.map((col) => {
      const colDeals = dealsList.filter((d) => d.stage === col.id);
      const total = colDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      return {
        ...col,
        count: colDeals.length,
        totalAmount: total,
        deals: colDeals.map((d) => {
          const matchedContact = contactsList.find((c) => c.id === d.contact_id);
          return {
            id: d.id,
            title: d.title,
            contact_id: d.contact_id,
            company_id: d.company_id,
            contact_name:
              d.contact_name ||
              d.contact?.name ||
              (matchedContact ? matchedContact.name : null),
            company_name: d.company_name || d.company?.name || null,
            amount: Number(d.amount) || 0,
            priority: d.priority || "medium",
          };
        }),
      };
    });
    setColumns(updated);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [dealsRes, contactsRes] = await Promise.allSettled([
        api.get("/deals"),
        api.get("/contacts"),
      ]);

      const contactsRaw = contactsRes.status === "fulfilled" && Array.isArray(contactsRes.value.data)
        ? contactsRes.value.data
        : [];
      const mappedContacts: ContactOption[] = contactsRaw.map((c: any) => ({
        id: c.id,
        name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.phone || "Без имени",
        phone: c.phone || undefined,
        email: c.email || undefined,
        company_name: c.company?.name || undefined,
      }));
      setContacts(mappedContacts);

      const dealsRaw = dealsRes.status === "fulfilled" && Array.isArray(dealsRes.value.data)
        ? dealsRes.value.data
        : [];
      distributeDealsToColumns(dealsRaw, mappedContacts);
    } catch (err) {
      console.warn("Backend API unavailable", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreateDialog = (stage = "new") => {
    setSelectedStage(stage);
    setDealTitle("");
    setDealAmount("");
    setDealPriority("medium");
    setDealDescription("");
    setSelectedContact(null);
    setContactSearch("");
    setDialogOpen(true);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle.trim()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        title: dealTitle.trim(),
        amount: parseFloat(dealAmount) || 0,
        currency: "KZT",
        stage: selectedStage,
        priority: dealPriority,
        description: dealDescription || undefined,
      };
      if (selectedContact?.id) {
        payload.contact_id = selectedContact.id;
        payload.company_id = selectedContact.company_id || undefined;
      }

      await api.post("/deals", payload);
      await loadAll();
      setDialogOpen(false);
    } catch (err) {
      console.error("Error creating deal", err);
      // Optimistic local update
      const newDeal: DealCardItem = {
        id: `dl_${Date.now()}`,
        title: dealTitle,
        contact_name: selectedContact?.name,
        amount: parseFloat(dealAmount) || 0,
        priority: dealPriority,
      };
      setColumns((prev) =>
        prev.map((col) =>
          col.id === selectedStage
            ? { ...col, count: col.count + 1, totalAmount: col.totalAmount + newDeal.amount, deals: [newDeal, ...col.deals] }
            : col
        )
      );
      setDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    (c.name || "").toLowerCase().includes(contactSearch.toLowerCase()) ||
    (c.phone || "").includes(contactSearch) ||
    (c.email || "").toLowerCase().includes(contactSearch.toLowerCase())
  );

  const getPriorityDot = (p: string) => {
    switch (p) {
      case "high": return <span className="h-2 w-2 rounded-full bg-red-400 shrink-0" title="Высокий" />;
      case "medium": return <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" title="Средний" />;
      default: return <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" title="Низкий" />;
    }
  };

  const totalDealsCount = columns.reduce((sum, c) => sum + c.count, 0);
  const totalPipelineAmount = columns.reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Воронка сделок</span>
            <Badge variant="default" className="text-xs font-mono">Kanban</Badge>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {totalDealsCount === 0 ? "Сделок нет — создайте первую" : `${totalDealsCount} сделок · ${formatCurrency(totalPipelineAmount)} в пайплайне`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDeals} disabled={loading} className="h-9 text-xs gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => openCreateDialog("new")} size="sm" className="h-9 gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Новая сделка</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4 snap-x">
        <div className="grid grid-flow-col auto-cols-[280px] sm:auto-cols-[300px] lg:grid-cols-6 lg:auto-cols-auto gap-4 min-w-[1200px] lg:min-w-0">
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex flex-col bg-slate-50/80 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-white/10 p-3 snap-start"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-200 dark:border-white/10 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${col.color}`} />
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider truncate">
                      {col.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-zinc-300 font-medium">
                    {col.count}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  {formatCurrency(col.totalAmount)}
                </div>
              </div>

              {/* Deal Cards */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[520px] pr-0.5">
                {col.deals.length > 0 ? (
                  col.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-3 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/10 hover:border-blue-400/60 dark:hover:border-zinc-600 transition-all cursor-pointer group space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-white transition-colors leading-snug">
                          {deal.title}
                        </h4>
                        {getPriorityDot(deal.priority)}
                      </div>

                      {/* Contact link */}
                      {deal.contact_name && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                          <User className="h-3 w-3 text-blue-400 shrink-0" />
                          <span className="truncate">{deal.contact_name}</span>
                        </div>
                      )}
                      {!deal.contact_name && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <User className="h-3 w-3 opacity-40 shrink-0" />
                          <span className="italic opacity-60">Клиент не указан</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(deal.amount)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-8 text-center cursor-pointer opacity-50 hover:opacity-70 transition-opacity"
                    onClick={() => openCreateDialog(col.id)}
                  >
                    <Plus className="h-5 w-5 text-slate-400 mb-1" />
                    <span className="text-[11px] text-slate-400">Добавить сделку</span>
                  </div>
                )}
              </div>

              {/* Add button at bottom of col */}
              <button
                onClick={() => openCreateDialog(col.id)}
                className="mt-3 w-full text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors border border-dashed border-slate-200 dark:border-white/[0.06]"
              >
                <Plus className="h-3 w-3" /> Добавить
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Summary Bar */}
      <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4 divide-x divide-slate-100 dark:divide-white/[0.06]">
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Всего сделок</span>
            <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono">{totalDealsCount}</span>
          </div>
          <div className="pl-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Сумма в пайплайне</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(totalPipelineAmount)}</span>
          </div>
          <div className="pl-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400 block">Успешно закрыто</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
              {columns.find((c) => c.id === "won")?.count || 0}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG: CREATE DEAL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-zinc-100 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-zinc-100">Создать новую сделку</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Заполните поля и привяжите клиента из базы контактов
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDeal} className="space-y-4 mt-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Название сделки *</label>
              <Input
                required
                placeholder="Поставка ПО в ТОО «КазАгро»"
                value={dealTitle}
                onChange={(e) => setDealTitle(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Contact search */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Клиент / Контакт</label>
              {selectedContact ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-200 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-950/30">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-100">{selectedContact.name}</p>
                      <p className="text-[11px] text-slate-500">{selectedContact.phone || selectedContact.email || ""}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedContact(null); setContactSearch(""); }}
                    className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-700"
                  >
                    Сменить
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder="Поиск по имени, телефону..."
                    value={contactSearch}
                    onChange={(e) => { setContactSearch(e.target.value); setShowContactList(true); }}
                    onFocus={() => setShowContactList(true)}
                    className="pl-9 h-9 text-sm"
                  />
                  {showContactList && contactSearch.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xl">
                      {filteredContacts.length === 0 ? (
                        <div className="p-3 text-xs text-slate-400 text-center">Контакт не найден</div>
                      ) : (
                        filteredContacts.slice(0, 10).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => { setSelectedContact(c); setContactSearch(""); setShowContactList(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 text-left transition-colors"
                          >
                            <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold shrink-0">
                              {(c.name || "?")[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100 truncate">{c.name}</span>
                              <span className="text-[11px] text-slate-400 truncate">{c.phone || c.email || ""}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              {contacts.length === 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  ⚠ Контактов нет — сначала создайте контакт, или сделка будет без привязки
                </p>
              )}
            </div>

            {/* Amount + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Сумма сделки (₸)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="500 000"
                  value={dealAmount}
                  onChange={(e) => setDealAmount(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Приоритет</label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-100"
                  value={dealPriority}
                  onChange={(e) => setDealPriority(e.target.value)}
                >
                  <option value="high">🔴 Высокий</option>
                  <option value="medium">🟡 Средний</option>
                  <option value="low">🟢 Низкий</option>
                </select>
              </div>
            </div>

            {/* Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Этап воронки</label>
              <select
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-100"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
              >
                <option value="new">Новый лид</option>
                <option value="qualification">Квалификация</option>
                <option value="proposal">Предложение</option>
                <option value="negotiation">Переговоры</option>
                <option value="won">Успешно закрыто</option>
                <option value="lost">Проиграно</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">Комментарий</label>
              <textarea
                rows={2}
                placeholder="Детали сделки, условия, примечания..."
                value={dealDescription}
                onChange={(e) => setDealDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 resize-none focus:outline-none focus:border-blue-400 dark:focus:border-zinc-600"
              />
            </div>

            <div className="pt-1 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" size="sm" disabled={submitting || !dealTitle.trim()}>
                {submitting ? "Создание..." : "Создать сделку"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
