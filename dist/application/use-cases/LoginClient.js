"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginClient = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class LoginClient {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }
    async execute(email, password) {
        const client = await this.clientRepository.findByEmail(email);
        if (!client)
            throw new Error("Email ou mot de passe invalide");
        // Vérification du mot de passe
        const isPasswordValid = await bcryptjs_1.default.compare(password, client.getPasswordHash());
        if (!isPasswordValid)
            throw new Error("Email ou mot de passe invalide");
        // Vérification que le compte est confirmé
        if (!client.getIsVerified())
            throw new Error("Compte non vérifié. Merci de confirmer votre email.");
        // Génération d’un JWT pour la session
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("JWT_SECRET non défini");
        const payload = { clientId: client.getId() };
        const expiresInEnv = process.env.JWT_EXPIRES_IN;
        const options = { expiresIn: expiresInEnv ? expiresInEnv : "1d" };
        const token = jsonwebtoken_1.default.sign(payload, secret, options);
        return token;
    }
}
exports.LoginClient = LoginClient;
