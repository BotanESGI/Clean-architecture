"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TransferFunds_1 = require("../TransferFunds");
const Account_1 = require("../../../domain/entities/Account");
const Client_1 = require("../../../domain/entities/Client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Mock repositories
class MockAccountRepository {
    constructor() {
        this.accounts = new Map();
    }
    async findByIban(iban) {
        return this.accounts.get(iban) || null;
    }
    async save(account) {
        this.accounts.set(account.iban, account);
    }
    async update(account) {
        this.accounts.set(account.iban, account);
    }
    async findById(id) {
        for (const account of this.accounts.values()) {
            if (account.id === id)
                return account;
        }
        return null;
    }
    async findByOwnerId(ownerId) {
        return Array.from(this.accounts.values()).filter(a => a.clientId === ownerId);
    }
    async listAll() {
        return Array.from(this.accounts.values());
    }
    async create(account) {
        this.accounts.set(account.iban, account);
    }
    async delete(iban) {
        this.accounts.delete(iban);
    }
}
class MockClientRepository {
    constructor() {
        this.clients = new Map();
    }
    async findById(id) {
        return this.clients.get(id) || null;
    }
    async findByEmail(email) {
        for (const client of this.clients.values()) {
            if (client.getEmail() === email)
                return client;
        }
        return null;
    }
    async save(client) {
        this.clients.set(client.getId(), client);
    }
    async update(client) {
        this.clients.set(client.getId(), client);
    }
    async findAll() {
        return Array.from(this.clients.values());
    }
    async delete(id) {
        this.clients.delete(id);
    }
}
class MockTransactionRepository {
    constructor() {
        this.transactions = [];
    }
    async create(transaction) {
        this.transactions.push(transaction);
    }
    async findByAccountId(accountId) {
        return this.transactions.filter(t => t.accountId === accountId);
    }
    async findByAccountIds(accountIds) {
        return this.transactions.filter(t => accountIds.includes(t.accountId));
    }
}
describe("TransferFunds", () => {
    let accountRepo;
    let clientRepo;
    let transactionRepo;
    let transferFunds;
    beforeEach(() => {
        accountRepo = new MockAccountRepository();
        clientRepo = new MockClientRepository();
        transactionRepo = new MockTransactionRepository();
        transferFunds = new TransferFunds_1.TransferFunds(accountRepo, clientRepo, transactionRepo);
    });
    it("should successfully transfer funds between two accounts", async () => {
        // Create two clients
        const client1 = new Client_1.Client("client1", "John", "Doe", "john@example.com", await bcryptjs_1.default.hash("password", 10), true, [], 'CLIENT', false);
        const client2 = new Client_1.Client("client2", "Jane", "Smith", "jane@example.com", await bcryptjs_1.default.hash("password", 10), true, [], 'CLIENT', false);
        await clientRepo.save(client1);
        await clientRepo.save(client2);
        // Create two accounts
        const account1 = new Account_1.Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 1000);
        const account2 = new Account_1.Account("acc2", "client2", "FR7698765432109876543210987", "Compte 2", 500);
        await accountRepo.save(account1);
        await accountRepo.save(account2);
        // Transfer 200 from account1 to account2
        const result = await transferFunds.execute(account1.iban, account2.iban, 200);
        expect(result.success).toBe(true);
        expect(result.fromBalance).toBe(800);
        expect(result.toBalance).toBe(700);
        // Verify balances
        const updatedAccount1 = await accountRepo.findByIban(account1.iban);
        const updatedAccount2 = await accountRepo.findByIban(account2.iban);
        expect(updatedAccount1?.balance).toBe(800);
        expect(updatedAccount2?.balance).toBe(700);
    });
    it("should throw error when trying to transfer to a non-existent account (not in bank)", async () => {
        const client1 = new Client_1.Client("client1", "John", "Doe", "john@example.com", await bcryptjs_1.default.hash("password", 10), true, [], 'CLIENT', false);
        await clientRepo.save(client1);
        const account1 = new Account_1.Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 1000);
        await accountRepo.save(account1);
        // Try to transfer to a non-existent IBAN
        await expect(transferFunds.execute(account1.iban, "FR9999999999999999999999999", 100)).rejects.toThrow("Le bénéficiaire n'est pas client de Banque AVENIR. Les transferts ne sont possibles qu'entre comptes de la banque.");
    });
    it("should throw error when from account does not exist", async () => {
        const client2 = new Client_1.Client("client2", "Jane", "Smith", "jane@example.com", await bcryptjs_1.default.hash("password", 10), true, [], 'CLIENT', false);
        await clientRepo.save(client2);
        const account2 = new Account_1.Account("acc2", "client2", "FR7698765432109876543210987", "Compte 2", 500);
        await accountRepo.save(account2);
        await expect(transferFunds.execute("FR9999999999999999999999999", account2.iban, 100)).rejects.toThrow("Compte expéditeur introuvable");
    });
    it("should throw error when amount is invalid", async () => {
        const client1 = new Client_1.Client("client1", "John", "Doe", "john@example.com", await bcryptjs_1.default.hash("password", 10), true, [], 'CLIENT', false);
        const client2 = new Client_1.Client("client2", "Jane", "Smith", "jane@example.com", await bcryptjs_1.default.hash("password", 10), true, [], 'CLIENT', false);
        await clientRepo.save(client1);
        await clientRepo.save(client2);
        const account1 = new Account_1.Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 1000);
        const account2 = new Account_1.Account("acc2", "client2", "FR7698765432109876543210987", "Compte 2", 500);
        await accountRepo.save(account1);
        await accountRepo.save(account2);
        await expect(transferFunds.execute(account1.iban, account2.iban, -100)).rejects.toThrow("Montant invalide");
        await expect(transferFunds.execute(account1.iban, account2.iban, 0)).rejects.toThrow("Montant invalide");
    });
    it("should throw error when trying to transfer to the same account", async () => {
        const client1 = new Client_1.Client("client1", "John", "Doe", "john@example.com", await bcryptjs_1.default.hash("password", 10), true, [], 'CLIENT', false);
        await clientRepo.save(client1);
        const account1 = new Account_1.Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 1000);
        await accountRepo.save(account1);
        await expect(transferFunds.execute(account1.iban, account1.iban, 100)).rejects.toThrow("Impossible de transférer vers le même compte");
    });
    it("should throw error when insufficient balance", async () => {
        const client1 = new Client_1.Client("client1", "John", "Doe", "john@example.com", await bcryptjs_1.default.hash("password", 10), true, [], 'CLIENT', false);
        const client2 = new Client_1.Client("client2", "Jane", "Smith", "jane@example.com", await bcryptjs_1.default.hash("password", 10), true, [], 'CLIENT', false);
        await clientRepo.save(client1);
        await clientRepo.save(client2);
        const account1 = new Account_1.Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 100);
        const account2 = new Account_1.Account("acc2", "client2", "FR7698765432109876543210987", "Compte 2", 500);
        await accountRepo.save(account1);
        await accountRepo.save(account2);
        await expect(transferFunds.execute(account1.iban, account2.iban, 200)).rejects.toThrow("Solde insuffisant");
    });
});
