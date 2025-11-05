"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterClient = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Client_1 = require("../../domain/entities/Client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
class RegisterClient {
    constructor(clientRepository, emailService) {
        this.clientRepository = clientRepository;
        this.emailService = emailService;
    }
    async execute(firstName, lastName, email, password) {
        const existing = await this.clientRepository.findByEmail(email);
        console.log("Existing client:", existing);
        if (existing)
            throw new Error("Email déjà utilisé");
        const policy = {
            minLen: 8,
            upper: /[A-Z]/,
            lower: /[a-z]/,
            digit: /\d/,
            special: /[^A-Za-z0-9]/,
        };
        if (!password ||
            password.length < policy.minLen ||
            !policy.upper.test(password) ||
            !policy.lower.test(password) ||
            !policy.digit.test(password) ||
            !policy.special.test(password)) {
            throw new Error("Mot de passe invalide. Exigences: 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.");
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const client = new Client_1.Client(crypto_1.default.randomUUID(), firstName, lastName, email, passwordHash, false);
        await this.clientRepository.save(client);
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error("JWT_SECRET non défini dans .env");
        const payload = { clientId: client.getId() };
        const expiresInEnv = process.env.JWT_EXPIRES_IN;
        const options = { expiresIn: expiresInEnv ? expiresInEnv : "1d" };
        const token = jsonwebtoken_1.default.sign(payload, secret, options);
        await this.emailService.sendConfirmationEmail(email, token);
        return client;
    }
}
exports.RegisterClient = RegisterClient;
