"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "../hooks/useTranslation";

export default function Error({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error("Erreur application:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="relative w-full max-w-2xl">
        {/* Effets de fond avec glow (rouge pour l'erreur) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-500/5 blur-3xl" />
        </div>

        {/* Contenu principal */}
        <div className="relative glass border border-red-500/20 rounded-2xl p-8 md:p-12 shadow-glow text-center">
          {/* Icône 500 stylisée */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-red-500/10 border-2 border-red-500/30 relative">
              <span className="text-6xl font-extrabold text-red-400">500</span>
              <div className="absolute inset-0 rounded-full bg-red-500/5 animate-pulse" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {t("errors.500.title")}
          </h1>

          {/* Description */}
          <p className="text-muted text-lg mb-8 max-w-md mx-auto">
            {t("errors.500.message")}
          </p>

          {/* Détails de l'erreur (dev uniquement) */}
          {process.env.NODE_ENV !== "production" && error.message && (
            <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-left">
              <p className="text-xs font-semibold text-red-400 mb-2">Détails de l&apos;erreur (dev):</p>
              <p className="text-xs text-muted font-mono break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-muted mt-2">
                  <span className="font-semibold">Digest:</span> {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {reset && (
              <button onClick={reset} className="btn-primary">
                Réessayer
              </button>
            )}
            <Link href="/" className="btn-secondary">
              {t("nav.home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


