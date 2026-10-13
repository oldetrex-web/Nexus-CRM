"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Mail,
  Phone,
  Shield,
  Target,
  DollarSign,
  RefreshCw,
  UserPlus,
  Briefcase,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

interface TeamMember {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState("manager");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/team");
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Team endpoint might not exist yet — show empty
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formEmail) return;
    setSubmitting(true);
    try {
      const res = await api.post("/team", {
        first_name: formFirstName,
        last_name: formLastName || null,
        email: formEmail,
        phone: formPhone || null,
        role: formRole,
      });
      if (res.data) setMembers((prev) => [...prev, res.data]);
      setDialogOpen(false);
      setFormFirstName(""); setFormLastName("");
      setFormEmail(""); setFormPhone("");
    } catch (err) {
      console.error("Error inviting member", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Администратор</Badge>;
      case "manager":
        return <Badge variant="secondary">Менеджер</Badge>;
      case "kam":
        return <Badge variant="outline" className="text-cyan-600 border-cyan-400">KAM</Badge>;
      case "accountant":
        return <Badge variant="outline">Бухгалтер</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>Команда & Управление</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {loading
              ? "Загрузка..."
              : members.length === 0
              ? "Команда пока не добавлена — пригласите первого сотрудника"
              : `${members.length} ${members.length === 1 ? "сотрудник" : "сотрудников"} в системе`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMembers}
            disabled={loading}
            className="h-10 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" className="gap-2 h-10" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Добавить сотрудника</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Сотрудников</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {loading ? "—" : members.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">активных учётных записей</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Менеджеров</span>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {loading ? "—" : members.filter((m) => m.role === "manager" || m.role === "kam").length}
            </div>
            <p className="text-xs text-slate-500 mt-1">работают с клиентами</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">KAM специалисты</span>
            <Shield className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">
              {loading ? "—" : members.filter((m) => m.role === "kam").length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Key Account изоляция</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Администраторов</span>
            <Target className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {loading ? "—" : members.filter((m) => m.role === "admin").length}
            </div>
            <p className="text-xs text-slate-500 mt-1">полный доступ к системе</p>
          </CardContent>
        </Card>
      </div>

      {/* Team List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="h-7 w-7 text-slate-400 animate-spin" />
          <p className="text-sm text-slate-500">Загрузка команды...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
              <Users className="h-9 w-9 text-indigo-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
              <Plus className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-center max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">
              Команда пока пуста
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Пригласите менеджеров, KAM-специалистов и администраторов.
              У каждого будет свой личный кабинет и изолированная база клиентов.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2 h-10 px-6">
            <UserPlus className="h-4 w-4" />
            Пригласить первого сотрудника
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Сотрудники системы
          </h3>
          {members.map((m) => (
            <Card
              key={m.id}
              className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-sm"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-11 w-11 ring-1 ring-slate-200 dark:ring-white/10">
                    <AvatarFallback className="font-semibold text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200">
                      {m.first_name[0]}{m.last_name?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {m.first_name} {m.last_name}
                      {getRoleBadge(m.role)}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {m.email}
                      </span>
                      {m.phone && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3" /> {m.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Badge variant={m.is_active ? "success" : "outline"} className="text-xs">
                    {m.is_active ? "Активен" : "Неактивен"}
                  </Badge>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Настроить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* DIALOG: INVITE MEMBER */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Добавить сотрудника</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Сотрудник получит доступ к системе согласно своей роли
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Имя *</label>
                <Input required placeholder="Иван" value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Фамилия</label>
                <Input placeholder="Петров" value={formLastName} onChange={(e) => setFormLastName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Email *</label>
              <Input required type="email" placeholder="manager@company.kz" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Телефон</label>
              <Input placeholder="+7 (777) 000-00-00" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Роль в системе</label>
              <select
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
              >
                <option value="admin">Администратор — полный доступ</option>
                <option value="manager">Менеджер по продажам</option>
                <option value="kam">KAM — изолированная база клиентов</option>
                <option value="accountant">Бухгалтер — счета и документы</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Отмена</Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Добавление..." : "Добавить в команду"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
