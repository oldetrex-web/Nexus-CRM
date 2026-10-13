"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  RefreshCw,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface TaskItem {
  id: string;
  title: string;
  type: "call" | "meeting" | "task" | "email";
  status: "new" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  assignee_id?: string;
  contact_id?: string;
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("task");
  const [formPriority, setFormPriority] = useState("medium");
  const [formDueDate, setFormDueDate] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Failed to fetch tasks", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    setSubmitting(true);
    try {
      const payload = {
        title: formTitle,
        type: formType,
        priority: formPriority,
        status: "new",
        due_date: formDueDate || null,
      };
      const res = await api.post("/tasks", payload);
      if (res.data) {
        setTasks((prev) => [res.data, ...prev]);
      }
      setDialogOpen(false);
      setFormTitle("");
      setFormDueDate("");
    } catch (err) {
      console.error("Error creating task", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async (task: TaskItem) => {
    try {
      const newStatus = task.status === "completed" ? "new" : "completed";
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus as TaskItem["status"] } : t))
      );
    } catch (err) {
      console.error("Error updating task status", err);
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500 shrink-0" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
      default:
        return <CheckSquare className="h-5 w-5 text-slate-400 shrink-0" />;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "urgent":
        return <Badge variant="destructive">Срочно</Badge>;
      case "high":
        return <Badge variant="warning">Высокий</Badge>;
      case "medium":
        return <Badge variant="default">Средний</Badge>;
      default:
        return <Badge variant="outline">Обычный</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "call": return "📞 Звонок";
      case "meeting": return "🤝 Встреча";
      case "email": return "✉️ Email";
      default: return "✅ Задача";
    }
  };

  const counts = {
    all: tasks.length,
    new: tasks.filter((t) => t.status === "new").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Задачи и Напоминания
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {loading
              ? "Загрузка задач..."
              : tasks.length === 0
              ? "Задач пока нет — создайте первую"
              : `${tasks.length} задач в системе`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTasks}
            disabled={loading}
            className="h-10 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Обновить</span>
          </Button>
          <Button className="gap-2 w-full sm:w-auto h-10" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Новая задача</span>
          </Button>
        </div>
      </div>

      {/* Tabs Filter */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-white/10 overflow-x-auto justify-start h-10 w-full sm:w-auto">
          <TabsTrigger value="all">Все ({counts.all})</TabsTrigger>
          <TabsTrigger value="new">Новые ({counts.new})</TabsTrigger>
          <TabsTrigger value="in_progress">В работе ({counts.in_progress})</TabsTrigger>
          <TabsTrigger value="completed">Выполнены ({counts.completed})</TabsTrigger>
          <TabsTrigger value="overdue">Просрочены ({counts.overdue})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tasks List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="h-7 w-7 text-slate-400 animate-spin" />
          <p className="text-sm text-slate-500">Загрузка задач...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-zinc-800">
            <ListTodo className="h-8 w-8 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-700 dark:text-zinc-200">
              {filter !== "all" ? "Нет задач с этим статусом" : "Задач пока нет"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {filter !== "all"
                ? "Попробуйте другой фильтр"
                : "Нажмите «Новая задача», чтобы создать первую"}
            </p>
          </div>
          {filter === "all" && (
            <Button onClick={() => setDialogOpen(true)} className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Создать задачу
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <Card
              key={task.id}
              className="hover:border-blue-300 dark:hover:border-zinc-700 transition-all bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 shadow-sm"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="pt-0.5">{getStatusIcon(task.status)}</div>
                  <div className="space-y-1 min-w-0">
                    <h3
                      className={cn(
                        "text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100",
                        task.status === "completed" && "line-through text-slate-400 dark:text-zinc-500"
                      )}
                    >
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                      <span className="text-slate-600 dark:text-zinc-300 font-medium">
                        {getTypeLabel(task.type)}
                      </span>
                      {task.due_date && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(task.due_date).toLocaleDateString("ru-KZ", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {getPriorityBadge(task.priority)}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleCompleteTask(task)}
                  >
                    {task.status === "completed" ? "Открыть" : "Завершить"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* DIALOG: CREATE TASK */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-zinc-100">Новая задача</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Задача сохраняется в базу данных бэкенда
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-3 mt-2">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Название задачи *</label>
              <Input
                required
                placeholder="Позвонить клиенту по счету..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Тип</label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                >
                  <option value="task">Задача</option>
                  <option value="call">Звонок</option>
                  <option value="meeting">Встреча</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-zinc-400">Приоритет</label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                >
                  <option value="low">Обычный</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочно</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-zinc-400">Срок выполнения</label>
              <Input
                type="datetime-local"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Создание..." : "Создать задачу"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
