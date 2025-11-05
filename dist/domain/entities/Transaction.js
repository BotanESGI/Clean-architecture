"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
class Transaction {
    constructor(id, accountId, type, amount, label, relatedAccountId, // Pour les virements : ID du compte de l'autre partie
    relatedClientName, // Nom du client de l'autre partie
    createdAt = new Date()) {
        this.id = id;
        this.accountId = accountId;
        this.type = type;
        this.amount = amount;
        this.label = label;
        this.relatedAccountId = relatedAccountId;
        this.relatedClientName = relatedClientName;
        this.createdAt = createdAt;
    }
}
exports.Transaction = Transaction;
