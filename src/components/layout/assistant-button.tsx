"use client";

import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function AssistantButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Asistanı aç"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <Sparkles className="h-5 w-5" />
      </button>

      {/* Arka plan örtüsü (mobil/dar ekranlarda tıklanınca kapanır) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl transition-all duration-200",
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Asistan</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Asistanı kapat"
            className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          <div className="max-w-[85%] rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-sm">
            Merhaba efendim, bugün size nasıl yardımcı olabilirim?
          </div>
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              disabled
              placeholder="Mesajınızı yazın... (yakında)"
              className="h-9 flex-1 rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled
              className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          {/* TODO: Asistan backend bağlantısı - callBackend("asistan_mesaj_gonder", { mesaj }) burada çağrılacak */}
        </div>
      </div>
    </>
  );
}
