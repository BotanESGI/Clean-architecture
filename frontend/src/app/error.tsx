"use client";

import { useTranslation } from "../hooks/useTranslation";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card text-center">
        <h1 className="text-2xl font-bold mb-2">{t("errors.500.title")}</h1>
        <p className="text-muted">{t("errors.500.message")}</p>
        {process.env.NODE_ENV !== "production" && (
          <p className="text-xs text-muted mt-2">{error.message}</p>
        )}
      </div>
    </div>
  );
}


