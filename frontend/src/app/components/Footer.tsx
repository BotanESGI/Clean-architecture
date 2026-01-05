"use client";

import { useTranslation } from "../../hooks/useTranslation";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 py-8 text-center text-sm text-muted">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
        <p>&copy; {new Date().getFullYear()} {t("common.appName")}</p>
        <div className="flex gap-6">
          <a href="#privacy" className="hover:text-text">{t("footer.privacy")}</a>
          <a href="#terms" className="hover:text-text">{t("footer.terms")}</a>
        </div>
      </div>
    </footer>
  );
}

