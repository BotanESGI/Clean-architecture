"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotFound;
function NotFound() {
    return (<div className="min-h-[60vh] flex items-center justify-center">
      <div className="card text-center">
        <h1 className="text-2xl font-bold mb-2">404 - Page non trouvée</h1>
        <p className="text-muted">La page que vous cherchez n'existe pas.</p>
      </div>
    </div>);
}
