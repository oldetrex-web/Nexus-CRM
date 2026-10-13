"use client";

import React, { useState, useEffect } from "react";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  // Pages that render without sidebar
  const isAuthPage = pathname === "/login";
  const isOnboarding = pathname === "/onboarding";

  // ── Onboarding gate ──────────────────────────────────────────────────────
  // After a user logs in (user exists), check if onboarding is done.
  // On first login the flag is absent → redirect to /onboarding.
  // The flag is written to localStorage when the user finishes all steps.
  useEffect(() => {
    if (!user) return;                       // not logged in yet
    if (isAuthPage || isOnboarding) return;  // already on an auth/onboarding page

    const done = localStorage.getItem("nexus_onboarding_done");
    if (!done) {
      router.replace("/onboarding");
    }
  }, [user, pathname]);

  return (
    <html lang="ru" className="light">
      <head>
        <title>Nexus CRM — AI-native SaaS Platform</title>
        <meta
          name="description"
          content="Next-generation AI CRM platform with multi-channel inbox, intelligent pipelines, and autonomous AI agents."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        {/* Theme hydration — runs before React to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('nexus-theme');
                if (saved === 'dark') {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 flex flex-col antialiased selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-zinc-800 dark:selection:text-white">
        {isAuthPage || isOnboarding ? (
          <main className="flex-1 w-full">{children}</main>
        ) : (
          <div className="flex min-h-screen w-full">
            {/* Sidebar */}
            <Sidebar
              mobileOpen={mobileMenuOpen}
              setMobileOpen={setMobileMenuOpen}
            />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 w-full md:pl-16 lg:pl-60 transition-all duration-200">
              <Header onMenuClick={() => setMobileMenuOpen(true)} />

              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10">
                {children}
              </main>

              {/* Mobile Bottom Navigation */}
              <MobileNav />
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
