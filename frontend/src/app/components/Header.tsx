"use client";

import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const userRole = token ? decodeRole(token) : null;
  const dashboardPath = userRole === 'director' ? '/director/dashboard' : '/dashboard';
  const isOnDashboard = pathname === "/dashboard" || pathname === "/director/dashboard";

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
            {token ? (
              isOnDashboard ? (
                <>
                  <button className="btn-secondary">Manager profil</button>
                  <button onClick={handleLogout} className="btn-secondary">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link href={dashboardPath} className="btn-secondary">Tableau de bord</Link>
                  <button onClick={handleLogout} className="btn-secondary">Déconnexion</button>
                </>
              )
            ) : (
              <>
                <Link href="/login" className="btn-secondary">Se connecter</Link>
                <Link href="/register" className="btn-primary">Explorer</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
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
