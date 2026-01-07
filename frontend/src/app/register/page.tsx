"use client";

import { useEffect } from "react";
import { RegisterForm } from "../../components/organisms/RegisterForm";
import { useTranslation } from "../../hooks/useTranslation";

export default function RegisterPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div className="hidden lg:block">
        <h1 className="text-4xl font-extrabold leading-tight">
          {t("auth.registerWelcome")}{" "}
          <span className="text-primary">{t("auth.registerWelcomeHighlight")}</span>
        </h1>
        <p className="text-muted mt-3 max-w-md">{t("auth.registerDescription")}</p>
        <div className="mt-10 relative h-72">
          <div className="absolute -left-6 top-0 w-48 phone-card"><div className="phone-notch" /><div className="aspect-[9/19]" /></div>
          <div className="absolute left-24 top-10 w-48 rotate-6 phone-card"><div className="phone-notch" /><div className="aspect-[9/19]" /></div>
        </div>
      </div>

      <div className="glass border border-white/10 rounded-2xl p-8 shadow-glow w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">{t("auth.registerTitle")}</h2>
        <RegisterForm />
      </div>
    </div>
  );
}
