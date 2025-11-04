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
      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "pointer-events-auto card min-w-[260px] px-4 py-3 shadow-glow border " +
              (t.type === "success"
                ? "border-primary/40"
                : t.type === "error"
                ? "border-red-500/40"
                : t.type === "warning"
                ? "border-yellow-500/40"
                : "border-white/10")
            }
          >
            <p className="text-sm">{t.text}</p>
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


