"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { PrivateChat } from "../../../components/organisms/PrivateChat/PrivateChat";
import { decodeClientId } from "../../../lib/utils";

export default function ContactPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { t } = useTranslation();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const id = decodeClientId(token);
    if (!id) {
      router.push("/login");
      return;
    }

    setClientId(id);
  }, [token, router]);

  if (!token || !clientId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{t("contact.contactAdvisor")}</h1>
          <p className="text-muted text-sm mt-1">{t("contact.contactDescription")}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="btn-secondary"
        >
          {t("contact.backToDashboard")}
        </button>
      </div>

      <PrivateChat clientId={clientId} />
    </div>
  );
}

