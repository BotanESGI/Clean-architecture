"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const react_1 = require("react");
const api_1 = __importDefault(require("../../lib/api"));
const AuthContext_1 = require("../../contexts/AuthContext");
const ToastContext_1 = require("../../contexts/ToastContext");
const navigation_1 = require("next/navigation");
function LoginPage() {
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [message, setMessage] = (0, react_1.useState)("");
    const { setToken } = (0, AuthContext_1.useAuth)();
    const { show } = (0, ToastContext_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await api_1.default.login({ email, password });
            localStorage.setItem("token", res.token);
            setToken(res.token);
            setMessage("Connexion réussie !");
            show("Connexion réussie", "success");
            router.push("/dashboard");
        }
        catch (err) {
            const msg = err.message || "Erreur lors de la connexion";
            setMessage(msg);
            show(msg, "error");
        }
    };
    return (<div className="grid lg:grid-cols-2 gap-10 items-center">
     
      <div className="hidden lg:block">
        <h1 className="text-4xl font-extrabold leading-tight">Bienvenue sur <span className="text-primary">Banque AVENIR</span></h1>
        <p className="text-muted mt-3 max-w-md">Connectez-vous pour accéder à vos comptes, paiements et services sécurisés.</p>
        <div className="mt-10 relative h-72">
          <div className="absolute -left-6 top-0 w-48 phone-card"><div className="phone-notch"/><div className="aspect-[9/19]"/></div>
          <div className="absolute left-24 top-10 w-48 rotate-6 phone-card"><div className="phone-notch"/><div className="aspect-[9/19]"/></div>
        </div>
      </div>

      
      <div className="glass border border-white/10 rounded-2xl p-8 shadow-glow w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Se connecter</h2>
        {message && <div className="alert alert-error mb-4">{message}</div>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="field">
            <input type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} className={message ? "input-minimal input-invalid" : "input-minimal"}/>
            <label>Email</label>
          </div>
          <div className="field">
            <input type="password" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} className={message ? "input-minimal input-invalid" : "input-minimal"}/>
            <label>Mot de passe</label>
          </div>
          <button type="submit" className="btn-primary w-full">Se connecter</button>
        </form>
      </div>
    </div>);
}
