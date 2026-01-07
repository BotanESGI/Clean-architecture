"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "../../../hooks/useTranslation";

export default function RegisterSentPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold mb-2">{t("register.checkEmailTitle")}</h1>
          <p className="text-muted">
            {t("register.checkEmailDescription")} {email ? `à ${email}` : t("register.checkEmailDescription2")}. {t("register.checkEmailDescription3")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/" className="btn-secondary">{t("register.backToHome")}</Link>
            <Link href="/login" className="btn-primary">{t("nav.login")}</Link>
          </div>
        </div>
      </div>
  );
}
