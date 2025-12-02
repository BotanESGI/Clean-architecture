"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";

export default function AdvisorDashboard() {
  const { token } = useAuth();
  const router = useRouter();

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
          <h1 className="text-3xl font-bold">Dashboard Conseiller</h1>
          <p className="text-muted mt-2">Bienvenue dans votre espace conseiller bancaire</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Messagerie</h3>
            <p className="text-muted text-sm">Gérer les messages des clients</p>
            <p className="text-xs text-muted mt-4">À implémenter</p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-2">Gestion des crédits</h3>
            <p className="text-muted text-sm">Octroyer et gérer les crédits</p>
            <p className="text-xs text-muted mt-4">À implémenter</p>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-2">Clients</h3>
            <p className="text-muted text-sm">Voir et gérer les clients</p>
            <p className="text-xs text-muted mt-4">À implémenter</p>
          </div>
        </div>
      </div>
    </div>
  );
}

