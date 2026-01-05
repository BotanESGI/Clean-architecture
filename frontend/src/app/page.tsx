import { cachedFetch } from "../lib/api-cache";
import HomeContent from "./components/HomeContent";

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

  return <HomeContent savingsRate={savingsRate} />;
}

// Métadonnées pour le SEO
export const metadata = {
  title: "Banque AVENIR - La meilleure plateforme bancaire",
  description: "Gérez vos comptes, paiements et épargne avec une sécurité de niveau bancaire.",
};


