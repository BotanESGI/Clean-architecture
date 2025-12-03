import React from "react";
import { cachedFetch } from "../lib/api-cache";

/**
 * Page d'accueil - Server Component
 * Les données peuvent être préchargées côté serveur avec cache
 */
export default async function Home() {
  // Exemple: Charger le taux d'épargne avec cache (revalidate toutes les heures)
  let savingsRate: number | null = null;
  try {
    const rateData = await cachedFetch<{ rate: number }>("/savings-rate", {
      next: { revalidate: 3600 }, // Cache 1 heure
    });
    savingsRate = rateData.rate;
  } catch (error) {
    // En cas d'erreur, on continue sans le taux
    console.error("Erreur lors du chargement du taux d'épargne:", error);
  }

  return (
    <div className="space-y-24">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 p-8 md:p-14 bg-gradient-to-b from-white/5 to-white/0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Gardez votre argent en sécurité
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              La meilleure plateforme <span className="text-primary">bancaire</span> <br /> pour votre avenir.
            </h1>
            <p className="text-muted max-w-xl">
              Gérez vos comptes, paiements et épargne avec une sécurité de niveau bancaire et une protection renforcée.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="/register" className="btn-primary">Ouvrir un compte</a>
              <a href="#learn" className="btn-secondary">En savoir plus</a>
            </div>
            {savingsRate !== null && (
              <div className="flex items-center gap-4 pt-4">
                <div className="text-sm">
                  <p className="text-muted">Taux d&apos;épargne actuel</p>
                  <p className="text-2xl font-bold text-primary">{savingsRate.toFixed(2)}% / an</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {/* Placeholder pour avatars */}
              </div>
              <div className="text-sm">
                <p className="text-text font-medium">+10 000 clients satisfaits</p>
                <p className="text-muted">Rejoignez notre communauté</p>
              </div>
            </div>
          </div>
          <div className="relative h-96 lg:h-[500px]">
            {/* Placeholder pour illustration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl" />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Nos services</h2>
          <p className="text-muted mt-3">Tout ce dont vous avez besoin pour gérer vos finances</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Comptes particuliers et professionnels</h3>
            <p className="text-muted text-sm">Gérez vos comptes avec facilité et sécurité.</p>
          </div>
          <div className="card">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Sécurité et conformité</h3>
            <p className="text-muted text-sm">Protection maximale de vos données et transactions.</p>
          </div>
          <div className="card">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Dépôts protégés</h3>
            <p className="text-muted text-sm">Vos dépôts sont protégés jusqu&apos;à 100 000€.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Métadonnées pour le SEO
export const metadata = {
  title: "Banque AVENIR - La meilleure plateforme bancaire",
  description: "Gérez vos comptes, paiements et épargne avec une sécurité de niveau bancaire.",
};
