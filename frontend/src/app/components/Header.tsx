"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";

export default function Header() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const isOnDashboard = pathname?.startsWith("/dashboard");

  // Éviter l'erreur d'hydratation en ne rendant le contenu conditionnel qu'après le montage
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-lg/0">
      <div className="glass">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/90 shadow-glow" />
            <span className="font-extrabold tracking-tight">
              {language === "fr" ? "Banque" : "Bank"}{" "}
              <span className="text-primary">AVENIR</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#services" className="hover:text-text">{t("nav.services")}</a>
            <a href="#about" className="hover:text-text">{t("nav.about")}</a>
            <a href="#security" className="hover:text-text">{t("nav.security")}</a>
            <a href="#contact" className="hover:text-text">{t("nav.contact")}</a>
          </nav>
          <div className="flex items-center gap-3">
            {/* Sélecteur de langue */}
            <button
              onClick={toggleLanguage}
              className="icon-btn text-xs font-semibold min-w-[2.5rem]"
              title={language === "fr" ? "Switch to English" : "Passer en français"}
            >
              {language === "fr" ? "EN" : "FR"}
            </button>
            {!mounted ? (
              // Pendant le SSR, afficher un état neutre pour éviter l'erreur d'hydratation
              <>
                <div className="btn-secondary opacity-0">{t("nav.login")}</div>
                <div className="btn-primary opacity-0">{t("nav.register")}</div>
              </>
            ) : token ? (
              isOnDashboard ? (
                <>
                  <Link href="/dashboard/contact" className="btn-secondary">{t("nav.contact")}</Link>
                  <button onClick={handleLogout} className="btn-secondary">{t("nav.logout")}</button>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="btn-secondary">{t("nav.dashboard")}</Link>
                  <button onClick={handleLogout} className="btn-secondary">{t("nav.logout")}</button>
                </>
              )
            ) : (
              <>
                <Link href="/login" className="btn-secondary">{t("nav.login")}</Link>
                <Link href="/register" className="btn-primary">{t("nav.register")}</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

