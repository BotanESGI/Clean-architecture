"use client";
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getInitialToken);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    try {
      if (t) localStorage.setItem("token", t);
      else localStorage.removeItem("token");
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
    try {
      localStorage.removeItem("token");
    } catch {}
  }, []);

  return <AuthContext.Provider value={{ token, setToken, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
