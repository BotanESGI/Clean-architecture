"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./styles/globals.css");
const AuthContext_1 = require("../contexts/AuthContext");
const ToastContext_1 = require("../contexts/ToastContext");
const Header_1 = __importDefault(require("./components/Header"));
exports.metadata = {
    title: "Banque AVENIR",
    description: "Votre plateforme bancaire sécurisée",
};
function RootLayout({ children }) {
    return (<html lang="fr">
      <body className="bg-background text-text font-sans min-h-screen flex flex-col relative overflow-x-hidden">
        {/* background layers */}
        <div className="pointer-events-none absolute inset-0 radial-fade"/>
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40"/>

        {/* Navbar & Content */}
        <AuthContext_1.AuthProvider>
          <ToastContext_1.ToastProvider>
            <Header_1.default />
            <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
          </ToastContext_1.ToastProvider>
        </AuthContext_1.AuthProvider>

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
    </html>);
}
