import "./styles/globals.css";
import { Providers } from "./components/Providers";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Métadonnées par défaut pour toutes les pages
export const metadata = {
  title: {
    default: "Banque AVENIR",
    template: "%s | Banque AVENIR",
  },
  description: "Votre plateforme bancaire sécurisée - Gestion de comptes, virements et épargne en ligne",
  keywords: ["banque en ligne", "compte bancaire", "épargne", "virement", "finance"],
  authors: [{ name: "Banque AVENIR" }],
  creator: "Banque AVENIR",
  publisher: "Banque AVENIR",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Banque AVENIR",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-background text-text font-sans min-h-screen flex flex-col relative overflow-x-hidden">
        {/* background layers */}
        <div className="pointer-events-none absolute inset-0 radial-fade" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

        {/* Navbar & Content */}
        <Providers>
          <Header />
          <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
