import "./styles/globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../contexts/ToastContext";
import Header from "./components/Header";

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
        <AuthProvider>
          <ToastProvider>
            <Header />
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
