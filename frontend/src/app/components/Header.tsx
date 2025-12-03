"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isOnDashboard = pathname?.startsWith("/dashboard");

  // Éviter l'erreur d'hydratation en ne rendant le contenu conditionnel qu'après le montage
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-lg/0">
      <div className="glass">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/90 shadow-glow" />
            <span className="font-extrabold tracking-tight">Banque <span className="text-primary">AVENIR</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#services" className="hover:text-text">Services</a>
            <a href="#about" className="hover:text-text">À propos</a>
            <a href="#security" className="hover:text-text">Sécurité</a>
            <a href="#contact" className="hover:text-text">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            {!mounted ? (
              // Pendant le SSR, afficher un état neutre pour éviter l'erreur d'hydratation
              <>
                <div className="btn-secondary opacity-0">Se connecter</div>
                <div className="btn-primary opacity-0">Inscription</div>
              </>
            ) : token ? (
              isOnDashboard ? (
                <>
                  <Link href="/dashboard/contact" className="btn-secondary">Contact</Link>
                  <button onClick={handleLogout} className="btn-secondary">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="btn-secondary">Tableau de bord</Link>
                  <button onClick={handleLogout} className="btn-secondary">Déconnexion</button>
                </>
              )
            ) : (
              <>
                <Link href="/login" className="btn-secondary">Se connecter</Link>
                <Link href="/register" className="btn-primary">Inscription</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

