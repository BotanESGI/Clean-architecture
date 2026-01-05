"use client";

import { useTranslation } from "../../hooks/useTranslation";

export default function Footer() {
  const { t } = useTranslation();
  // Utiliser une année fixe pour éviter les problèmes d'hydratation
  const currentYear = 2024;

  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-muted">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        <p>&copy; {currentYear} {t("common.appName")}</p>
        <div className="flex gap-6">
          <a href="#privacy" className="hover:text-text">{t("footer.privacy")}</a>
          <a href="#terms" className="hover:text-text">{t("footer.terms")}</a>
        </div>
      </div>
    </footer>
  );
}

