"use client";

import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const show = (text: string, type: ToastType = "info", durationMs = 3000) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, text };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  };

  const value = useMemo(() => ({ show }), []);

  const toastContainer = (
    <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-3 items-center" style={{ zIndex: 999999 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            "pointer-events-auto min-w-[320px] max-w-[420px] px-4 py-4 rounded-lg shadow-2xl flex items-start gap-4 border-2 backdrop-blur-md"
          }
          style={{
            backgroundColor: 'rgb(26, 26, 26)',
            borderColor: 'rgba(184, 255, 61, 0.5)',
            zIndex: 999999,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className={
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold " +
            (t.type === "success"
              ? "bg-emerald-500 text-white"
              : t.type === "error"
              ? "bg-red-500 text-white"
              : t.type === "warning"
              ? "bg-amber-500 text-white"
              : "bg-blue-500 text-white")
          }>
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "ℹ"}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-white font-semibold text-base mb-1 leading-tight">{t.text}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted && typeof document !== "undefined" && createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}


