"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { AssistantButton } from "./assistant-button";
import { ROUTE_TITLES } from "./nav-items";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const title = ROUTE_TITLES[pathname ?? ""] ?? "Madenova";

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Geniş ekranlarda sabit kenar çubuğu */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Dar ekranlarda açılır kenar çubuğu (drawer) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200 ${
          drawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full transition-transform duration-200 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Menüyü kapat"
              className="absolute right-[-2.5rem] top-4 flex h-8 w-8 items-center justify-center rounded-md bg-background text-foreground shadow"
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menüyü aç"
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-medium">{title}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      <AssistantButton />
    </div>
  );
}
