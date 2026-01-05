"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import Link from "next/link";
import { useToast } from "../../../contexts/ToastContext";
import { useTranslation } from "../../../hooks/useTranslation";

export default function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = React.use(params);
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>(t("confirm.confirming"));
  const [ok, setOk] = useState<boolean | null>(null);
  const { show } = useToast();

  useEffect(() => {
    async function run() {
      try {
        const res = await api.confirm(token);
        setMessage(res.message || t("confirm.success"));
        setOk(true);
        show(t("confirm.success"), "success");
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : t("confirm.invalidLink");
        setMessage(message);
        setOk(false);
        show(t("confirm.failure"), "error");
      }
    }
    run();
  }, [token, show]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-2">{ok ? t("confirm.successTitle") : t("confirm.title")}</h1>
        <p className={ok === false ? "text-red-500" : "text-muted"}>{message}</p>
        {ok && (
          <p className="text-muted mt-2">{t("confirm.canLogin")}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/login" className="btn-primary">{t("nav.login")}</Link>
          <Link href="/" className="btn-secondary">{t("nav.home")}</Link>
        </div>
      </div>
    </div>
  );
}


