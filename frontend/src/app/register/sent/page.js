"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RegisterSentPage;
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
function RegisterSentPage() {
    const params = (0, navigation_1.useSearchParams)();
    const email = params.get("email");
    return (<div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Vérifiez votre boîte mail</h1>
        <p className="text-muted">
          Nous avons envoyé un lien de confirmation {email ? `à ${email}` : "par email"}. Cliquez dessus pour
          activer votre compte.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <link_1.default href="/" className="btn-secondary">Retour à l’accueil</link_1.default>
          <link_1.default href="/login" className="btn-primary">Se connecter</link_1.default>
        </div>
      </div>
    </div>);
}
