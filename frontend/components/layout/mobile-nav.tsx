"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  Users,
  MoreHorizontal,
  X,
  Building2,
  CheckSquare,
  Package,
  FileText,
  BarChart3,
  Settings,
  Plug,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const mainTabs = [
    { name: "Дашборд", href: "/", icon: LayoutDashboard },
    { name: "Инбокс", href: "/inbox", icon: Inbox },
    { name: "Сделки", href: "/deals", icon: Briefcase },
    { name: "Контакты", href: "/contacts", icon: Users },
  ];

  const moreItems = [
    { name: "Компании", href: "/companies", icon: Building2 },
    { name: "Задачи", href: "/tasks", icon: CheckSquare },
    { name: "Склад", href: "/warehouse", icon: Package },
    { name: "Аналитика", href: "/analytics", icon: BarChart3 },
    { name: "Документы", href: "/documents", icon: FileText },
    { name: "Парсер прайсов", href: "/price-parser", icon: FileSpreadsheet },
    { name: "Интеграции", href: "/integrations", icon: Plug },
    { name: "Настройки", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Fixed Bottom Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {mainTabs.map((tab) => {
            const isActive =
              tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center h-full space-y-1 relative transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-tight tracking-tight">
                  {tab.name}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" />
                )}
              </Link>
            );
          })}

          {/* "Ещё" Button */}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center h-full space-y-1 transition-colors",
              sheetOpen ? "text-indigo-600 dark:text-purple-400" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] leading-tight">Ещё</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet for "Ещё" */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />
          <div className="relative bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-white/10 rounded-t-2xl p-5 shadow-2xl z-10 max-h-[75vh] overflow-y-auto pb-20 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                Все разделы
              </span>
              <button
                onClick={() => setSheetOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium"
                        : "bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-xs font-medium truncate">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
