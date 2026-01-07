"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateMissingInterest = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Transaction_1 = require("../../domain/entities/Transaction");
// Calcule les intérêts manquants depuis la création du compte ou la dernière transaction d'intérêts
class CalculateMissingInterest {
    constructor(accountRepo, bankSettingsRepo, transactionRepo) {
        this.accountRepo = accountRepo;
        this.bankSettingsRepo = bankSettingsRepo;
        this.transactionRepo = transactionRepo;
    }
    async execute() {
        const savingsRate = await this.bankSettingsRepo.getSavingsRate();
        // Récupérer tous les comptes d'épargne non fermés
        const allAccounts = await this.accountRepo.listAll();
        const savingsAccounts = allAccounts.filter(acc => acc.accountType === "savings" && !acc.isClosed && acc.balance > 0);
        let accountsProcessed = 0;
        let totalInterest = 0;
        for (const account of savingsAccounts) {
            // Trouver la dernière transaction d'intérêts
            const transactions = await this.transactionRepo.findByAccountId(account.id);
            const interestTransactions = transactions.filter(t => t.label.includes("Intérêts quotidiens"));
            // Date de départ: dernière transaction d'intérêts ou date de création du compte
            let startDate;
            if (interestTransactions.length > 0) {
                // Prendre la date de la dernière transaction d'intérêts
                const lastInterestDate = new Date(Math.max(...interestTransactions.map(t => new Date(t.createdAt).getTime())));
                // Commencer le jour suivant
                startDate = new Date(lastInterestDate);
                startDate.setDate(startDate.getDate() + 1);
                startDate.setHours(0, 0, 0, 0);
            }
            else {
                // Aucune transaction d'intérêts, utiliser la date de création du compte
                startDate = account.createdAt || new Date();
                startDate.setHours(0, 0, 0, 0);
            }
            // Date de fin: aujourd'hui (exclu, on calcule jusqu'à hier)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // Calculer le nombre de jours entre startDate et aujourd'hui
            const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff > 0) {
                // Calculer les intérêts pour tous les jours manquants
                // On utilise le solde actuel (approximation - idéalement il faudrait le solde de chaque jour)
                const dailyInterest = (account.balance * savingsRate) / 365;
                const missingInterest = dailyInterest * daysDiff;
                if (missingInterest > 0) {
                    // Créditer le compte avec les intérêts manquants
                    account.credit(missingInterest);
                    await this.accountRepo.update(account);
                    // Créer une transaction pour tracer les intérêts manquants
                    const interestTransaction = new Transaction_1.Transaction(crypto_1.default.randomUUID(), account.id, "transfer_in", missingInterest, `Intérêts quotidiens manquants (${daysDiff} jour${daysDiff > 1 ? 's' : ''}, ${(savingsRate * 100).toFixed(2)}%)`, undefined, undefined, new Date());
                    await this.transactionRepo.create(interestTransaction);
                    accountsProcessed++;
                    totalInterest += missingInterest;
                }
            }
        }
        return { accountsProcessed, totalInterest };
    }
}
exports.CalculateMissingInterest = CalculateMissingInterest;
