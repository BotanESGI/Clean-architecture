"use strict";
// Version refactorisée avec Result au lieu de throw
// Plus facile à tester et les erreurs sont explicites
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterClient = exports.RegisterClientError = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Client_1 = require("../../domain/entities/Client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const Result_1 = require("../../domain/value-objects/Result");
const passwordValidator_1 = require("../../domain/utils/passwordValidator");
class RegisterClientError extends Error {
    constructor(message) {
        super(message);
        this.name = "RegisterClientError";
    }
}
exports.RegisterClientError = RegisterClientError;
class RegisterClient {
    constructor(clientRepository, emailService) {
        this.clientRepository = clientRepository;
        this.emailService = emailService;
    }
    async execute(firstName, lastName, email, password) {
        // Vérifier si l'email existe déjà
        const existingClient = await this.clientRepository.findByEmail(email);
        if (existingClient) {
            return (0, Result_1.failure)(new RegisterClientError("Email déjà utilisé"));
        }
        // Valider le mot de passe
        const passwordValidation = (0, passwordValidator_1.validatePassword)(password);
        if (passwordValidation.isFailure) {
            return passwordValidation;
        }
        // Check si JWT_SECRET est défini
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return (0, Result_1.failure)(new RegisterClientError("JWT_SECRET non défini dans .env"));
        }
        // Hash le mot de passe
        const passwordHash = await bcryptjs_1.default.hash(passwordValidation.value, 10);
        // Créer le nouveau client
        const client = new Client_1.Client(crypto_1.default.randomUUID(), firstName, lastName, email, passwordHash, false, [], 'CLIENT', false);
        await this.clientRepository.save(client);
        // Générer le token pour la confirmation
        const expiresInEnv = process.env.JWT_EXPIRES_IN;
        const expiresIn = expiresInEnv
            ? expiresInEnv
            : "1d";
        const payload = { clientId: client.getId() };
        const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
        // Envoyer l'email de confirmation
        await this.emailService.sendConfirmationEmail(email, token);
        return (0, Result_1.success)(client);
    }
}
exports.RegisterClient = RegisterClient;
