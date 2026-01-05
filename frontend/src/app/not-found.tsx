"use client";

import { useTranslation } from "../hooks/useTranslation";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card text-center">
        <h1 className="text-2xl font-bold mb-2">{t("errors.404.title")}</h1>
        <p className="text-muted">{t("errors.404.message")}</p>
      </div>
    </div>
  );
}


