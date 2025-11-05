"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConfirmPage;
const react_1 = __importStar(require("react"));
const api_1 = __importDefault(require("../../../lib/api"));
const link_1 = __importDefault(require("next/link"));
const ToastContext_1 = require("../../../contexts/ToastContext");
function ConfirmPage({ params }) {
    const { token } = react_1.default.use(params);
    const [message, setMessage] = (0, react_1.useState)("Confirmation en cours...");
    const [ok, setOk] = (0, react_1.useState)(null);
    const { show } = (0, ToastContext_1.useToast)();
    (0, react_1.useEffect)(() => {
        async function run() {
            try {
                const res = await api_1.default.confirm(token);
                setMessage(res.message || "Compte confirmé avec succès");
                setOk(true);
                show("Compte confirmé avec succès", "success");
            }
            catch (e) {
                setMessage(e.message || "Le lien de confirmation est invalide ou expiré.");
                setOk(false);
                show("Échec de la confirmation", "error");
            }
        }
        run();
    }, [token]);
    return (<div className="min-h-[60vh] flex items-center justify-center">
      <div className="card max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-2">{ok ? "Votre compte est confirmé" : "Confirmation du compte"}</h1>
        <p className={ok === false ? "text-red-500" : "text-muted"}>{message}</p>
        {ok && (<p className="text-muted mt-2">Vous pouvez maintenant vous connecter pour accéder à vos services.</p>)}
        <div className="mt-6 flex items-center justify-center gap-3">
          <link_1.default href="/login" className="btn-primary">Se connecter</link_1.default>
          <link_1.default href="/" className="btn-secondary">Accueil</link_1.default>
        </div>
      </div>
    </div>);
}
