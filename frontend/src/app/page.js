"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const react_1 = __importDefault(require("react"));
function Home() {
    return (<div className="space-y-24">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 p-8 md:p-14 bg-gradient-to-b from-white/5 to-white/0">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"/>
          <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl"/>
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"/>
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
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-card border border-white/10"/>
                <div className="h-8 w-8 rounded-full bg-card border border-white/10"/>
                <div className="h-8 w-8 rounded-full bg-card border border-white/10"/>
                <div className="h-8 w-8 rounded-full bg-card border border-white/10"/>
              </div>
              <p className="text-sm text-muted">
                <span className="text-text font-semibold">168K+</span> clients satisfaits
              </p>
            </div>
          </div>

          {/* phone mock stack */}
          <div className="relative h-[520px] lg:h-[560px]">
            <div className="absolute left-6 top-8 rotate-[-8deg] w-56 sm:w-64 md:w-72 phone-card">
              <div className="phone-notch"/>
              <div className="aspect-[9/19]"/>
            </div>
            <div className="absolute left-24 top-40 rotate-[8deg] w-56 sm:w-64 md:w-72 phone-card">
              <div className="phone-notch"/>
              <div className="aspect-[9/19]"/>
            </div>
            <div className="absolute right-2 bottom-0 rotate-[-3deg] w-56 sm:w-64 md:w-72 phone-card">
              <div className="phone-notch"/>
              <div className="aspect-[9/19]"/>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST/FEATURES STRIP */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-muted">01.</p>
          <h3 className="text-xl font-semibold mt-2">Comptes particuliers et professionnels</h3>
        </div>
        <div className="card border-primary/40 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-36 w-36 bg-primary/20 blur-2xl"/>
          <p className="text-sm text-muted">02.</p>
          <h3 className="text-xl font-semibold mt-2">Sécurité et conformité</h3>
          <p className="text-sm text-muted mt-2">Surveillance anti‑fraude • chiffrement • audits</p>
          <a href="#learn" className="btn-secondary mt-5 inline-block">En savoir plus</a>
        </div>
        <div className="card">
          <p className="text-sm text-muted">03.</p>
          <h3 className="text-xl font-semibold mt-2">Dépôts protégés</h3>
        </div>
      </section>

      {/* CTA BAR */}
      <section className="flex items-center justify-between gap-4 rounded-xl border border-white/10 p-6 glass">
        <div>
          <h3 className="text-lg font-semibold">Une banque de confiance, à tout moment.</h3>
          <p className="text-sm text-muted">Gérez, payez et épargnez en toute confiance.</p>
        </div>
        <a href="/register" className="btn-primary">Ouvrir un compte</a>
      </section>
    </div>);
}
