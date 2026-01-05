"use client";

import Link from "next/link";
import { useTranslation } from "../hooks/useTranslation";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="relative w-full max-w-2xl">
        {/* Effets de fond avec glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* Contenu principal */}
        <div className="relative glass border border-white/10 rounded-2xl p-8 md:p-12 shadow-glow text-center">
          {/* Icône 404 stylisée */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/30 relative">
              <span className="text-6xl font-extrabold text-primary">404</span>
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {t("errors.404.title")}
          </h1>

          {/* Description */}
          <p className="text-muted text-lg mb-8 max-w-md mx-auto">
            {t("errors.404.message")}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/" className="btn-primary">
              {t("nav.home")}
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              {t("nav.dashboard")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


