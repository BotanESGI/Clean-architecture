"use client";

import { useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { setToken } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.login({ email, password });
      localStorage.setItem("token", res.token);
      setToken(res.token);
      setMessage("Connexion réussie !");
      show("Connexion réussie", "success");
      
      // Rediriger selon le rôle
      const role = decodeRole(res.token);
      if (role === 'director') {
        router.push("/director/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err.message || "Erreur lors de la connexion";
      setMessage(msg);
      show(msg, "error");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
     
      <div className="hidden lg:block">
        <h1 className="text-4xl font-extrabold leading-tight">Bienvenue sur <span className="text-primary">Banque AVENIR</span></h1>
        <p className="text-muted mt-3 max-w-md">Connectez-vous pour accéder à vos comptes, paiements et services sécurisés.</p>
        <div className="mt-10 relative h-72">
          <div className="absolute -left-6 top-0 w-48 phone-card"><div className="phone-notch" /><div className="aspect-[9/19]" /></div>
          <div className="absolute left-24 top-10 w-48 rotate-6 phone-card"><div className="phone-notch" /><div className="aspect-[9/19]" /></div>
        </div>
      </div>

      
      <div className="glass border border-white/10 rounded-2xl p-8 shadow-glow w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Se connecter</h2>
        {message && <div className="alert alert-error mb-4">{message}</div>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="field">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={message ? "input-minimal input-invalid" : "input-minimal"}
            />
            <label>Email</label>
          </div>
          <div className="field">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={message ? "input-minimal input-invalid" : "input-minimal"}
            />
            <label>Mot de passe</label>
          </div>
          <button type="submit" className="btn-primary w-full">Se connecter</button>
        </form>
      </div>
    </div>
  );
}

function decodeRole(token: string | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
}
