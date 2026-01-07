"use client";

import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  text: string;
}

interface ToastContextType {
  show: (text: string, type?: ToastType, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (text: string, type: ToastType = "info", durationMs = 3000) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, text };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  };

  const value = useMemo(() => ({ show }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] flex flex-col gap-3 items-center">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "pointer-events-auto min-w-[320px] max-w-[420px] px-4 py-4 rounded-lg shadow-2xl flex items-start gap-4 bg-[#1a1a1a] border border-primary/40 text-primary"
            }
          >
            <div className={
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold bg-primary/90 text-black shadow-glow"
            }>
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "ℹ"}
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-primary font-semibold text-base mb-1 leading-tight">{t.text}</p>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}


