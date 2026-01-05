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

// Métadonnées SEO complètes pour la page d'accueil
export const metadata = {
  title: "Banque AVENIR - La meilleure plateforme bancaire en ligne",
  description: "Gérez vos comptes, paiements et épargne avec une sécurité de niveau bancaire. Ouvrez un compte en quelques minutes et profitez de services bancaires modernes et sécurisés.",
  keywords: [
    "banque en ligne",
    "compte bancaire",
    "épargne",
    "virement bancaire",
    "banque digitale",
    "finance",
    "gestion de compte",
    "banque sécurisée",
    "services bancaires",
    "taux d'épargne"
  ],
  authors: [{ name: "Banque AVENIR" }],
  creator: "Banque AVENIR",
  publisher: "Banque AVENIR",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Banque AVENIR",
    title: "Banque AVENIR - La meilleure plateforme bancaire en ligne",
    description: "Gérez vos comptes, paiements et épargne avec une sécurité de niveau bancaire. Ouvrez un compte en quelques minutes.",
    images: [
      {
        url: "/og-image.jpg", // Vous devrez ajouter cette image dans public/
        width: 1200,
        height: 630,
        alt: "Banque AVENIR - Plateforme bancaire sécurisée",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Banque AVENIR - La meilleure plateforme bancaire en ligne",
    description: "Gérez vos comptes, paiements et épargne avec une sécurité de niveau bancaire.",
    images: ["/og-image.jpg"],
    creator: "@banqueavenir",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Finance",
  classification: "Banking Services",
};


