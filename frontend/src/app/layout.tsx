import "./styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../contexts/ToastContext";
import Link from "next/link";

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

        {/* Navbar */}
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
                <a href="/login" className="btn-secondary">Se connecter</a>
                <a href="/register" className="btn-primary">Explorer</a>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <AuthProvider>
          <ToastProvider>
            <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
          </ToastProvider>
        </AuthProvider>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 text-center text-sm text-muted">
          <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
            <p>&copy; {new Date().getFullYear()} Banque AVENIR</p>
            <div className="flex gap-6">
              <a href="#privacy" className="hover:text-text">Confidentialité</a>
              <a href="#terms" className="hover:text-text">Conditions</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
