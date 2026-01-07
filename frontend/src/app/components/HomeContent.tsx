"use client";

import { useTranslation } from "../../hooks/useTranslation";

interface HomeContentProps {
  savingsRate: number | null;
}

export default function HomeContent({ savingsRate }: HomeContentProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialService",
            "name": "Banque AVENIR",
            "description": "Plateforme bancaire en ligne sécurisée pour la gestion de comptes, virements et épargne",
            "url": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "logo": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/logo.png`,
            "serviceType": "Banking Services",
            "areaServed": "FR",
            "offers": {
              "@type": "Offer",
              "name": "Services bancaires en ligne",
              "description": "Comptes bancaires, virements, épargne"
            }
          })
        }}
      />
      <div className="space-y-24">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-2xl border border-white/10 p-8 md:p-14 bg-gradient-to-b from-white/5 to-white/0" aria-label="Section principale">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("home.hero.tagline")}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              {t("home.hero.title")}{" "}
              <span className="text-primary">{t("home.hero.titleHighlight")}</span>{" "}
              <br />
              {t("home.hero.subtitle")}
            </h1>
            <p className="text-muted max-w-xl">
              {t("home.hero.description")}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="/register" className="btn-primary">{t("home.hero.ctaPrimary")}</a>
              <a href="#learn" className="btn-secondary">{t("home.hero.ctaSecondary")}</a>
            </div>
            {savingsRate !== null && (
              <div className="flex items-center gap-4 pt-4">
                <div className="text-sm">
                  <p className="text-muted">{t("home.hero.savingsRate")}</p>
                  <p className="text-2xl font-bold text-primary">
                    {savingsRate.toFixed(2)}% {t("home.hero.savingsRatePerYear")}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {/* Placeholder pour avatars */}
              </div>
              <div className="text-sm">
                <p className="text-text font-medium">{t("home.hero.satisfiedClients")}</p>
                <p className="text-muted">{t("home.hero.joinCommunity")}</p>
              </div>
            </div>
          </div>
          <div className="relative h-96 lg:h-[500px] flex items-center justify-center">
            {/* Prototype de téléphone */}
            <div className="relative w-64 h-[500px] phone-card border-2 border-white/20 shadow-[0_0_40px_rgba(184,255,61,0.15)]">
              <div className="phone-notch" />
              <div className="w-full h-full rounded-[28px] bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center">
                <span className="text-8xl">💰</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">{t("home.services.title")}</h2>
          <p className="text-muted mt-3">{t("home.services.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("home.services.accounts.title")}</h3>
            <p className="text-muted text-sm">{t("home.services.accounts.description")}</p>
          </div>
          <div className="card">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("home.services.security.title")}</h3>
            <p className="text-muted text-sm">{t("home.services.security.description")}</p>
          </div>
          <div className="card">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">{t("home.services.deposits.title")}</h3>
            <p className="text-muted text-sm">{t("home.services.deposits.description")}</p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

