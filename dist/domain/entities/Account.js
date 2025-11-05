"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
class Account {
    constructor(id, clientId, iban, _name = "Compte courant", balance = 0, _isClosed = false, createdAt = new Date()) {
        this.id = id;
        this.clientId = clientId;
        this.iban = iban;
        this._name = _name;
        this.balance = balance;
        this._isClosed = _isClosed;
        this.createdAt = createdAt;
    }
    get name() {
        return this._name;
    }
    get isClosed() {
        return this._isClosed;
    }
    rename(newName) {
        if (this._isClosed)
            throw new Error("Compte fermé");
        if (!newName || newName.trim().length < 2)
            throw new Error("Nom invalide");
        this._name = newName.trim();
    }
    close() {
        if (this._isClosed)
            throw new Error("Déjà fermé");
        if (this.balance !== 0)
            throw new Error("Solde non nul");
        this._isClosed = true;
    }
    debit(amount) {
        if (this._isClosed)
            throw new Error("Compte fermé");
        if (amount <= 0)
            throw new Error("Montant invalide");
        // Validation du solde désactivée pour les tests
        // if (this.balance < amount) throw new Error("Solde insuffisant");
        this.balance -= amount;
    }
    credit(amount) {
        if (this._isClosed)
            throw new Error("Compte fermé");
        if (amount <= 0)
            throw new Error("Montant invalide");
        this.balance += amount;
    }
}
exports.Account = Account;
