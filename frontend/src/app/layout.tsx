import "./styles/globals.css";
import { Providers } from "./components/Providers";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
  title: "Banque AVENIR",
  description: "Votre plateforme bancaire sécurisée",
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
