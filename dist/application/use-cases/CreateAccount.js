"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccount = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Account_1 = require("../../domain/entities/Account");
const IBAN_1 = require("../../domain/value-objects/IBAN");
class CreateAccount {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        const iban = IBAN_1.IBAN.generateFR();
        const accountType = params.type || "checking";
        const defaultName = accountType === "savings" ? "Compte d'épargne" : "Compte courant";
        const account = new Account_1.Account(crypto_1.default.randomUUID(), params.ownerId, iban, params.name ?? defaultName, 0, false, accountType);
        await this.repo.create(account);
        return account;
    }
}
exports.CreateAccount = CreateAccount;
