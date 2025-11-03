"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api";
import Link from "next/link";
import { useToast } from "../../../contexts/ToastContext";

export default function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = React.use(params);
  const [message, setMessage] = useState<string>("Confirmation en cours...");
  const [ok, setOk] = useState<boolean | null>(null);
  const { show } = useToast();

  useEffect(() => {
    async function run() {
      try {
        const res = await api.confirm(token);
        setMessage(res.message || "Compte confirmé avec succès");
        setOk(true);
        show("Compte confirmé avec succès", "success");
      } catch (e: any) {
        setMessage(e.message || "Le lien de confirmation est invalide ou expiré.");
        setOk(false);
        show("Échec de la confirmation", "error");
      }
    }
    run();
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-2">{ok ? "Votre compte est confirmé" : "Confirmation du compte"}</h1>
        <p className={ok === false ? "text-red-500" : "text-muted"}>{message}</p>
        {ok && (
          <p className="text-muted mt-2">Vous pouvez maintenant vous connecter pour accéder à vos services.</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/login" className="btn-primary">Se connecter</Link>
          <Link href="/" className="btn-secondary">Accueil</Link>
        </div>
      </div>
    </div>
  );
}


