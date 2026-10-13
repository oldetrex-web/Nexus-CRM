"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Briefcase,
  CheckSquare,
  Inbox,
  Package,
  FileText,
  FileSpreadsheet,
  UserCircle,
  Plug,
  CreditCard,
  Settings,
  X,
  Layers,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    title: "ОБЗОР",
    items: [
      { name: "Дашборд", href: "/", icon: LayoutDashboard },
      { name: "Аналитика", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "CRM",
    items: [
      { name: "Контакты", href: "/contacts", icon: Users },
      { name: "Компании", href: "/companies", icon: Building2 },
      { name: "Сделки", href: "/deals", icon: Briefcase },
      { name: "Задачи", href: "/tasks", icon: CheckSquare },
      { name: "Инбокс", href: "/inbox", icon: Inbox },
    ],
  },
  {
    title: "ОПЕРАЦИИ",
    items: [
      { name: "Склад & Резервы", href: "/warehouse", icon: Package },
      { name: "Парсер прайсов", href: "/price-parser", icon: FileSpreadsheet },
      { name: "Документы & Акты", href: "/documents", icon: FileText },
      { name: "Вертикали", href: "/verticals", icon: Layers },
    ],
  },
  {
    title: "УПРАВЛЕНИЕ",
    items: [
      { name: "Команда", href: "/team", icon: UserCircle },
      { name: "Интеграции", href: "/integrations", icon: Plug },
      { name: "Биллинг", href: "/billing", icon: CreditCard },
      { name: "Настройки", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c0c0e] border-r border-slate-200 dark:border-white/[0.08] select-none text-slate-700 dark:text-zinc-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200 dark:border-white/[0.08]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-lg bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
            N
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="font-semibold text-sm text-slate-900 dark:text-zinc-100 tracking-tight font-mono">
              NEXUS<span className="text-slate-400 font-sans">.crm</span>
            </span>
          </div>
        </Link>
        <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
          AI-Native
        </span>
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-2 lg:px-3 py-3 space-y-4">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            <h4 className="hidden lg:block uppercase text-[10px] tracking-wider text-slate-400 dark:text-zinc-500 font-semibold px-2.5 mb-1">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    title={item.name}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group relative",
                      isActive
                        ? "bg-slate-100 text-slate-950 font-semibold dark:bg-white/[0.08] dark:text-white"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-500 group-hover:text-slate-800 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                      )}
                    />
                    <span className="hidden lg:inline truncate flex-1">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-blue-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-zinc-950/40">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
          <Avatar className="h-7 w-7 ring-1 ring-slate-200 dark:ring-white/10">
            <AvatarFallback className="bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 text-xs font-medium">
              {user?.email?.[0]?.toUpperCase() || "D"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:flex flex-col truncate">
            <span className="text-xs font-medium text-slate-900 dark:text-zinc-200 truncate">
              {user?.email || "dongelek86@gmail.com"}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Dev Admin · Developer
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 md:w-16 lg:w-60 transition-all duration-200">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
