"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateDailyInterest = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Transaction_1 = require("../../domain/entities/Transaction");
class CalculateDailyInterest {
    constructor(accountRepo, bankSettingsRepo, transactionRepo) {
        this.accountRepo = accountRepo;
        this.bankSettingsRepo = bankSettingsRepo;
        this.transactionRepo = transactionRepo;
    }
    async execute() {
        // Récupérer le taux d'épargne actuel
        const savingsRate = await this.bankSettingsRepo.getSavingsRate();
        // Récupérer tous les comptes d'épargne non fermés
        const allAccounts = await this.accountRepo.listAll();
        const savingsAccounts = allAccounts.filter(acc => acc.accountType === "savings" && !acc.isClosed && acc.balance > 0);
        let accountsProcessed = 0;
        let totalInterest = 0;
        // Calculer les intérêts pour chaque compte d'épargne
        for (const account of savingsAccounts) {
            // Calculer l'intérêt quotidien : (solde * taux) / 365
            const dailyInterest = (account.balance * savingsRate) / 365;
            if (dailyInterest > 0) {
                // Créditer le compte avec les intérêts
                account.credit(dailyInterest);
                await this.accountRepo.update(account);
                // Créer une transaction pour tracer l'intérêt
                const interestTransaction = new Transaction_1.Transaction(crypto_1.default.randomUUID(), account.id, "transfer_in", dailyInterest, `Intérêts quotidiens (${(savingsRate * 100).toFixed(2)}%)`, undefined, undefined, new Date());
                await this.transactionRepo.create(interestTransaction);
                accountsProcessed++;
                totalInterest += dailyInterest;
            }
        }
        return { accountsProcessed, totalInterest };
    }
}
exports.CalculateDailyInterest = CalculateDailyInterest;
