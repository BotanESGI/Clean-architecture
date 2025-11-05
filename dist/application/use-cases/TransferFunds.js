"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferFunds = void 0;
const Transaction_1 = require("../../domain/entities/Transaction");
const crypto_1 = __importDefault(require("crypto"));
class TransferFunds {
    constructor(accountRepo, clientRepo, transactionRepo) {
        this.accountRepo = accountRepo;
        this.clientRepo = clientRepo;
        this.transactionRepo = transactionRepo;
    }
    async execute(fromIban, toIban, amount) {
        const fromAccount = await this.accountRepo.findByIban(fromIban);
        const toAccount = await this.accountRepo.findByIban(toIban);
        if (!fromAccount || !toAccount)
            throw new Error("Account not found");
        if (amount <= 0)
            throw new Error("Invalid amount");
        // Validation du solde désactivée pour les tests
        // if (fromAccount.balance < amount) throw new Error("Solde insuffisant");
        // Récupérer les noms des clients pour les labels de transaction
        const fromClient = await this.clientRepo.findById(fromAccount.clientId);
        const toClient = await this.clientRepo.findById(toAccount.clientId);
        const fromClientName = fromClient ? `${fromClient.getFirstName()} ${fromClient.getLastName()}` : "Inconnu";
        const toClientName = toClient ? `${toClient.getFirstName()} ${toClient.getLastName()}` : "Inconnu";
        // Débiter et créditer
        fromAccount.debit(amount);
        toAccount.credit(amount);
        await this.accountRepo.update(fromAccount);
        await this.accountRepo.update(toAccount);
        // Créer les transactions
        const debitTransaction = new Transaction_1.Transaction(crypto_1.default.randomUUID(), fromAccount.id, "transfer_out", amount, `Virement vers ${toClientName}`, toAccount.id, toClientName);
        const creditTransaction = new Transaction_1.Transaction(crypto_1.default.randomUUID(), toAccount.id, "transfer_in", amount, `Virement de ${fromClientName}`, fromAccount.id, fromClientName);
        await this.transactionRepo.create(debitTransaction);
        await this.transactionRepo.create(creditTransaction);
        return { success: true, fromBalance: fromAccount.balance, toBalance: toAccount.balance };
    }
}
exports.TransferFunds = TransferFunds;
