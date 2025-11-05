"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RegisterPage;
const react_1 = require("react");
const api_1 = __importDefault(require("../../lib/api"));
const ToastContext_1 = require("../../contexts/ToastContext");
const navigation_1 = require("next/navigation");
function RegisterPage() {
    const [firstname, setFirstname] = (0, react_1.useState)("");
    const [lastname, setLastname] = (0, react_1.useState)("");
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [message, setMessage] = (0, react_1.useState)("");
    const { show } = (0, ToastContext_1.useToast)();
    const router = (0, navigation_1.useRouter)();
    const [passwordError, setPasswordError] = (0, react_1.useState)("");
    const requirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        digit: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
    const passwordValid = Object.values(requirements).every(Boolean);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setPasswordError("");
        const policy = {
            minLen: 8,
            upper: /[A-Z]/,
            lower: /[a-z]/,
            digit: /\d/,
            special: /[^A-Za-z0-9]/,
        };
        const invalid = !password ||
            password.length < policy.minLen ||
            !policy.upper.test(password) ||
            !policy.lower.test(password) ||
            !policy.digit.test(password) ||
            !policy.special.test(password);
        if (invalid) {
            const msg = "Le mot de passe doit contenir 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.";
            setPasswordError(msg);
            show(msg, "error");
            return;
        }
        try {
            const res = await api_1.default.register({ firstname, lastname, email, password });
            const msg = res.message + " Vérifiez votre email pour confirmer votre compte.";
            setMessage(msg);
            show("Inscription réussie. Vérifiez votre email.", "success");
            router.push(`/register/sent?email=${encodeURIComponent(email)}`);
        }
        catch (err) {
            const msg = err.message || "Erreur lors de l'inscription";
            setMessage(msg);
            show(msg, "error");
        }
    };
    return (<div className="grid lg:grid-cols-2 gap-10 items-center">
      
      <div className="hidden lg:block">
        <h1 className="text-4xl font-extrabold leading-tight">Ouvrez votre compte <span className="text-primary">en quelques minutes</span></h1>
        <p className="text-muted mt-3 max-w-md">Profitez d’une sécurité de niveau bancaire, de paiements rapides et d’une gestion simple de vos finances.</p>
        <div className="mt-10 relative h-72">
          <div className="absolute -left-6 top-0 w-48 phone-card"><div className="phone-notch"/><div className="aspect-[9/19]"/></div>
          <div className="absolute left-24 top-10 w-48 rotate-6 phone-card"><div className="phone-notch"/><div className="aspect-[9/19]"/></div>
        </div>
      </div>

      
      <div className="glass border border-white/10 rounded-2xl p-8 shadow-glow w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Créer un compte</h2>
        {message && <div className="alert alert-error mb-4">{message}</div>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="field">
            <input className="input-minimal" type="text" placeholder=" " value={firstname} onChange={(e) => setFirstname(e.target.value)}/>
            <label>Prénom</label>
          </div>
          <div className="field">
            <input className="input-minimal" type="text" placeholder=" " value={lastname} onChange={(e) => setLastname(e.target.value)}/>
            <label>Nom</label>
          </div>
          <div className="field">
            <input className="input-minimal" type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)}/>
            <label>Email</label>
          </div>
          <div className="field">
            <input className={passwordError ? "input-minimal input-invalid" : "input-minimal"} type="password" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)}/>
            <label>Mot de passe</label>
            {passwordError ? (<p className="helper-error">{passwordError}</p>) : (<p className="helper">8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial.</p>)}
          </div>
          <ul className="text-xs text-muted grid grid-cols-2 gap-2">
            <li className={requirements.length ? "text-text" : "text-muted"}>8+ caractères</li>
            <li className={requirements.upper ? "text-text" : "text-muted"}>1 majuscule</li>
            <li className={requirements.lower ? "text-text" : "text-muted"}>1 minuscule</li>
            <li className={requirements.digit ? "text-text" : "text-muted"}>1 chiffre</li>
            <li className={requirements.special ? "text-text" : "text-muted"}>1 caractère spécial</li>
          </ul>
          <button type="submit" className="btn-primary w-full disabled:opacity-50" disabled={!passwordValid}>S'inscrire</button>
        </form>
      </div>
    </div>);
}
