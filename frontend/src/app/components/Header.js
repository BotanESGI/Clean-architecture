"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Header;
const link_1 = __importDefault(require("next/link"));
const AuthContext_1 = require("../../contexts/AuthContext");
const navigation_1 = require("next/navigation");
function Header() {
    const { token, logout } = (0, AuthContext_1.useAuth)();
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const isOnDashboard = pathname === "/dashboard";
    const handleLogout = () => {
        logout();
        router.push("/login");
    };
    return (<header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-lg/0">
      <div className="glass">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <link_1.default href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/90 shadow-glow"/>
            <span className="font-extrabold tracking-tight">Banque <span className="text-primary">AVENIR</span></span>
          </link_1.default>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#services" className="hover:text-text">Services</a>
            <a href="#about" className="hover:text-text">À propos</a>
            <a href="#security" className="hover:text-text">Sécurité</a>
            <a href="#contact" className="hover:text-text">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            {token ? (isOnDashboard ? (<>
                  <button className="btn-secondary">Manager profil</button>
                  <button onClick={handleLogout} className="btn-secondary">Déconnexion</button>
                </>) : (<>
                  <link_1.default href="/dashboard" className="btn-secondary">Tableau de bord</link_1.default>
                  <button onClick={handleLogout} className="btn-secondary">Déconnexion</button>
                </>)) : (<>
                <link_1.default href="/login" className="btn-secondary">Se connecter</link_1.default>
                <link_1.default href="/register" className="btn-primary">Explorer</link_1.default>
              </>)}
          </div>
        </div>
      </div>
    </header>);
}
