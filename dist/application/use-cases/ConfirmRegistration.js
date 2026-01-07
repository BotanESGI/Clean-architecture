"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmClientRegistration = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Account_1 = require("../../domain/entities/Account");
const IBAN_1 = require("../../domain/value-objects/IBAN");
const crypto_1 = __importDefault(require("crypto"));
class ConfirmClientRegistration {
    constructor(clientRepository, accountRepository) {
        this.clientRepository = clientRepository;
        this.accountRepository = accountRepository;
    }
    async execute(token) {
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
            throw new Error("Token invalide ou expiré");
        }
        const clientId = payload.clientId;
        const client = await this.clientRepository.findById(clientId);
        if (!client)
            throw new Error("Client introuvable");
        if (client.getIsVerified())
            throw new Error("Compte déjà confirmé");
        client.setIsVerified(true);
        await this.clientRepository.update(client);
        const iban = IBAN_1.IBAN.generateFR();
        const account = new Account_1.Account(crypto_1.default.randomUUID(), client.getId(), iban, "Compte courant", 0, false, "checking");
        await this.accountRepository.create(account);
        client.addAccountId(account.id);
        await this.clientRepository.update(client);
        return account;
    }
}
exports.ConfirmClientRegistration = ConfirmClientRegistration;
