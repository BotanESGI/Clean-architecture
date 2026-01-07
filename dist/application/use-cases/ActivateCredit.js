"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivateCredit = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Transaction_1 = require("../../domain/entities/Transaction");
class ActivateCredit {
    constructor(creditRepository, accountRepository, transactionRepository) {
        this.creditRepository = creditRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }
    async execute(creditId) {
        const credit = await this.creditRepository.findById(creditId);
        if (!credit) {
            throw new Error("Crédit introuvable");
        }
        if (credit.status !== "pending") {
            throw new Error("Seuls les crédits en attente peuvent être activés");
        }
        // Récupérer le compte
        const account = await this.accountRepository.findById(credit.accountId);
        if (!account) {
            throw new Error("Compte introuvable");
        }
        // Activer le crédit
        credit.activate();
        // Créditer le compte avec le montant du crédit
        account.credit(credit.amount);
        // Créer une transaction pour le versement du crédit
        const transaction = new Transaction_1.Transaction(crypto_1.default.randomUUID(), credit.accountId, "transfer_in", credit.amount, `Crédit octroyé - ${credit.amount.toFixed(2)}€`, undefined, undefined, new Date());
        await this.transactionRepository.create(transaction);
        await this.accountRepository.update(account);
        await this.creditRepository.update(credit);
    }
}
exports.ActivateCredit = ActivateCredit;
