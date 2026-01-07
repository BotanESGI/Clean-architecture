"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordCreditPayment = void 0;
const Transaction_1 = require("../../domain/entities/Transaction");
const crypto_1 = __importDefault(require("crypto"));
class RecordCreditPayment {
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
        if (credit.status !== "active") {
            throw new Error("Seuls les crédits actifs peuvent avoir des paiements");
        }
        // Récupérer le compte
        const account = await this.accountRepository.findById(credit.accountId);
        if (!account) {
            throw new Error("Compte introuvable");
        }
        // Vérifier que le compte a suffisamment de fonds pour la mensualité
        const totalMonthlyPayment = credit.monthlyPayment + credit.insuranceMonthlyAmount;
        if (account.balance < totalMonthlyPayment) {
            throw new Error("Solde insuffisant pour effectuer le paiement");
        }
        // Enregistrer le paiement
        const paymentDetails = credit.recordMonthlyPayment();
        // Débiter le compte
        account.debit(totalMonthlyPayment);
        // Créer une transaction pour le paiement
        const transaction = new Transaction_1.Transaction(crypto_1.default.randomUUID(), credit.accountId, "transfer_out", totalMonthlyPayment, `Paiement crédit - Capital: ${paymentDetails.capitalAmount.toFixed(2)}€, Intérêts: ${paymentDetails.interestAmount.toFixed(2)}€, Assurance: ${paymentDetails.insuranceAmount.toFixed(2)}€`, undefined, undefined, new Date());
        await this.transactionRepository.create(transaction);
        await this.accountRepository.update(account);
        await this.creditRepository.update(credit);
        return paymentDetails;
    }
}
exports.RecordCreditPayment = RecordCreditPayment;
