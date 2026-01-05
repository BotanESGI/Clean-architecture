"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";

export default function AdvisorDashboard() {
  const { token } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!token || role !== "ADVISOR") {
      router.push("/login");
      return;
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("advisor.title")}</h1>
          <p className="text-muted mt-2">{t("advisor.welcome")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-2">{t("advisor.messaging")}</h3>
            <p className="text-muted text-sm">{t("advisor.messagingDescription")}</p>
            <p className="text-xs text-muted mt-4">{t("advisor.toImplement")}</p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-2">{t("advisor.creditManagement")}</h3>
            <p className="text-muted text-sm">{t("advisor.creditManagementDescription")}</p>
            <p className="text-xs text-muted mt-4">{t("advisor.toImplement")}</p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-2">{t("advisor.clients")}</h3>
            <p className="text-muted text-sm">{t("advisor.clientsDescription")}</p>
            <p className="text-xs text-muted mt-4">{t("advisor.toImplement")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

