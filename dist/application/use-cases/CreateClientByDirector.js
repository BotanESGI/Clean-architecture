"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClientByDirector = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Client_1 = require("../../domain/entities/Client");
const Account_1 = require("../../domain/entities/Account");
const IBAN_1 = require("../../domain/value-objects/IBAN");
class CreateClientByDirector {
    constructor(clientRepository, accountRepository) {
        this.clientRepository = clientRepository;
        this.accountRepository = accountRepository;
    }
    async execute(firstName, lastName, email, password) {
        const existing = await this.clientRepository.findByEmail(email);
        if (existing)
            throw new Error("Email déjà utilisé");
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const client = new Client_1.Client(crypto_1.default.randomUUID(), firstName, lastName, email, passwordHash, true, // Directement vérifié
        [], 'CLIENT', false);
        await this.clientRepository.save(client);
        // Créer automatiquement un compte bancaire
        const iban = IBAN_1.IBAN.generateFR();
        const account = new Account_1.Account(crypto_1.default.randomUUID(), client.getId(), iban, "Compte courant", 0, false, "checking");
        await this.accountRepository.create(account);
        client.addAccountId(account.id);
        await this.clientRepository.update(client);
        return { client, account };
    }
}
exports.CreateClientByDirector = CreateClientByDirector;
