"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Error;
function Error({ error }) {
    return (<div className="min-h-[60vh] flex items-center justify-center">
      <div className="card text-center">
        <h1 className="text-2xl font-bold mb-2">500 - Erreur serveur</h1>
        <p className="text-muted">Quelque chose s'est mal passé. Veuillez réessayer plus tard.</p>
        {process.env.NODE_ENV !== "production" && (<p className="text-xs text-muted mt-2">{error.message}</p>)}
      </div>
    </div>);
}
