"use client";

import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";
import { useEffect, useState } from "react";

/**
 * Hook personnalisé pour gérer les comptes avec cache
 * TODO: Intégrer SWR ou React Query pour un meilleur cache
 */
export function useAccounts() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Array<{
    id: string;
    iban: string;
    name: string;
    balance: number;
    accountType?: string;
    createdAt?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const clientId = decodeClientId(token);
    if (!clientId) {
      setLoading(false);
      return;
    }

    async function loadAccounts() {
      try {
        setLoading(true);
        const list = await api.listAccounts(clientId);
        setAccounts(list);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, [token]);

  return { accounts, loading, error, refetch: () => {
    const clientId = decodeClientId(token);
    if (clientId) {
      api.listAccounts(clientId).then(setAccounts).catch(() => {});
    }
  }};
}

function decodeClientId(token: string | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload?.clientId ?? null;
  } catch {
    return null;
  }
}

