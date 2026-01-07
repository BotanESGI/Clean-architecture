"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdvisor = requireAdvisor;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAdvisor(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token d'authentification manquant" });
        }
        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "Configuration serveur invalide" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (decoded.role !== "ADVISOR") {
            return res.status(403).json({ message: "Accès refusé. Seuls les conseillers peuvent accéder à cette ressource." });
        }
        req.user = {
            clientId: decoded.clientId,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: "Token invalide" });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ message: "Token expiré" });
        }
        return res.status(500).json({ message: "Erreur lors de la vérification du token" });
    }
}
