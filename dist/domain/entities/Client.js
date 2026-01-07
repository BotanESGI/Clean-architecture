"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Client {
    constructor(id, firstName, lastName, email, passwordHashed, isVerified = false, accountIds = [], role = 'CLIENT', isBanned = false) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHashed = passwordHashed;
        this.isVerified = isVerified;
        this.accountIds = accountIds;
        this.role = role;
        this.isBanned = isBanned;
    }
    getId() {
        return this.id;
    }
    getFirstName() {
        return this.firstName;
    }
    getLastName() {
        return this.lastName;
    }
    getEmail() {
        return this.email;
    }
    getIsVerified() {
        return this.isVerified;
    }
    getAccountIds() {
        return this.accountIds;
    }
    setFirstName(firstName) {
        this.firstName = firstName;
    }
    setLastName(lastName) {
        this.lastName = lastName;
    }
    setEmail(email) {
        this.email = email;
    }
    setIsVerified(isVerified) {
        this.isVerified = isVerified;
    }
    addAccountId(accountId) {
        this.accountIds.push(accountId);
    }
    getPasswordHash() {
        return this.passwordHashed;
    }
    getRole() {
        return this.role;
    }
    getIsBanned() {
        return this.isBanned;
    }
    setIsBanned(banned) {
        this.isBanned = banned;
    }
}
exports.Client = Client;
