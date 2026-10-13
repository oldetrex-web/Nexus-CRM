"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Settings,
  Sparkles,
  Command,
  Zap,
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [hasUnread] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check saved theme or default to light
    const saved = localStorage.getItem("nexus_theme") as "light" | "dark" | null;
    const initial = saved || "light";
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("nexus_theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  };

  return (
    <header className="sticky top-0 z-20 h-14 w-full bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/[0.08] px-4 sm:px-6">
      <div className="flex items-center justify-between h-full gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Menu & Mobile Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Открыть меню"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2 md:hidden">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs">
              N
            </div>
            <span className="font-semibold text-zinc-900 dark:text-white text-sm font-mono">
              NEXUS
            </span>
          </Link>

          {/* Linear Style Search */}
          <div className="hidden sm:flex items-center relative w-64 lg:w-80">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <Input
              type="search"
              placeholder="Поиск по клиентам, сделкам (Cmd+K)..."
              className="pl-8 pr-12 h-8 text-xs rounded-lg"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none px-1 py-0.2 rounded bg-zinc-100 dark:bg-white/5 text-[10px] text-zinc-500 font-mono">
              <Command className="h-2.5 w-2.5" />K
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button (Light / Dark) */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-8 px-2.5 gap-1.5 text-xs text-zinc-700 dark:text-zinc-300"
            title={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
          >
            {theme === "light" ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Светлая</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Тёмная</span>
              </>
            )}
          </Button>

          {/* SaaS Trial 3-day indicator */}
          <Link href="/billing">
            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 py-0.5 px-2 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-mono cursor-pointer hover:bg-amber-500/20 transition-colors">
              <Clock className="h-3 w-3" />
              <span>Trial: 3 дня</span>
            </Badge>
          </Link>

          {/* AI Status */}
          <Link href="/ai-agents">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium font-mono">AI: GPT-4 + Claude</span>
            </div>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white h-8 w-8"
              aria-label="Уведомления"
            >
              <Bell className="h-3.5 w-3.5" />
              {hasUnread && (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </Button>
          </div>

          {/* Settings */}
          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white h-8 w-8"
              aria-label="Настройки"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
