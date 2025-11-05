"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAccountRepository = void 0;
class InMemoryAccountRepository {
    constructor() {
        this.accounts = new Map();
    }
    async create(account) {
        this.accounts.set(account.iban, account);
    }
    async findByIban(iban) {
        return this.accounts.get(iban) ?? null;
    }
    async update(account) {
        this.accounts.set(account.iban, account);
    }
    async findById(id) {
        for (const account of this.accounts.values()) {
            if (account.id === id) {
                return account;
            }
        }
        return null;
    }
    async findByOwnerId(ownerId) {
        const result = [];
        for (const account of this.accounts.values()) {
            if (account.clientId === ownerId) {
                result.push(account);
            }
        }
        return result;
    }
    async delete(iban) {
        this.accounts.delete(iban);
    }
    async listAll() {
        return Array.from(this.accounts.values());
    }
}
exports.InMemoryAccountRepository = InMemoryAccountRepository;
