"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Beneficiary = void 0;
class Beneficiary {
    constructor(id, ownerClientId, // Client qui a ajouté ce bénéficiaire
    iban, firstName, lastName, accountName, // Nom du compte du bénéficiaire
    createdAt = new Date()) {
        this.id = id;
        this.ownerClientId = ownerClientId;
        this.iban = iban;
        this.firstName = firstName;
        this.lastName = lastName;
        this.accountName = accountName;
        this.createdAt = createdAt;
    }
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
exports.Beneficiary = Beneficiary;
