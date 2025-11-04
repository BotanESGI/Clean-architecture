import { TransferFunds } from "../TransferFunds";
import { AccountRepository } from "../../repositories/AccountRepository";
import { ClientRepository } from "../../repositories/ClientRepository";
import { TransactionRepository } from "../../repositories/TransactionRepository";
import { Account } from "../../../domain/entities/Account";
import { Client } from "../../../domain/entities/Client";
import { Transaction } from "../../../domain/entities/Transaction";
import bcrypt from "bcryptjs";

// Mock repositories
class MockAccountRepository implements AccountRepository {
  private accounts: Map<string, Account> = new Map();

  async findByIban(iban: string): Promise<Account | null> {
    return this.accounts.get(iban) || null;
  }

  async save(account: Account): Promise<void> {
    this.accounts.set(account.iban, account);
  }

  async update(account: Account): Promise<void> {
    this.accounts.set(account.iban, account);
  }

  async findById(id: string): Promise<Account | null> {
    for (const account of this.accounts.values()) {
      if (account.id === id) return account;
    }
    return null;
  }

  async findByOwnerId(ownerId: string): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(a => a.clientId === ownerId);
  }

  async listAll(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async create(account: Account): Promise<void> {
    this.accounts.set(account.iban, account);
  }

  async delete(iban: string): Promise<void> {
    this.accounts.delete(iban);
  }
}

class MockClientRepository implements ClientRepository {
  private clients: Map<string, Client> = new Map();

  async findById(id: string): Promise<Client | null> {
    return this.clients.get(id) || null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    for (const client of this.clients.values()) {
      if (client.getEmail() === email) return client;
    }
    return null;
  }

  async save(client: Client): Promise<void> {
    this.clients.set(client.getId(), client);
  }

  async update(client: Client): Promise<void> {
    this.clients.set(client.getId(), client);
  }
}

class MockTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = [];

  async create(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction);
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    return this.transactions.filter(t => t.accountId === accountId);
  }

  async findByAccountIds(accountIds: string[]): Promise<Transaction[]> {
    return this.transactions.filter(t => accountIds.includes(t.accountId));
  }
}

describe("TransferFunds", () => {
  let accountRepo: MockAccountRepository;
  let clientRepo: MockClientRepository;
  let transactionRepo: MockTransactionRepository;
  let transferFunds: TransferFunds;

  beforeEach(() => {
    accountRepo = new MockAccountRepository();
    clientRepo = new MockClientRepository();
    transactionRepo = new MockTransactionRepository();
    transferFunds = new TransferFunds(accountRepo, clientRepo, transactionRepo);
  });

  it("should successfully transfer funds between two accounts", async () => {
    // Create two clients
    const client1 = new Client("client1", "John", "Doe", "john@example.com", await bcrypt.hash("password", 10), true);
    const client2 = new Client("client2", "Jane", "Smith", "jane@example.com", await bcrypt.hash("password", 10), true);
    await clientRepo.save(client1);
    await clientRepo.save(client2);

    // Create two accounts
    const account1 = new Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 1000);
    const account2 = new Account("acc2", "client2", "FR7698765432109876543210987", "Compte 2", 500);
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
    const client1 = new Client("client1", "John", "Doe", "john@example.com", await bcrypt.hash("password", 10), true);
    await clientRepo.save(client1);

    const account1 = new Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 1000);
    await accountRepo.save(account1);

    // Try to transfer to a non-existent IBAN
    await expect(
      transferFunds.execute(account1.iban, "FR9999999999999999999999999", 100)
    ).rejects.toThrow("Le bénéficiaire n'est pas client de Banque AVENIR. Les transferts ne sont possibles qu'entre comptes de la banque.");
  });

  it("should throw error when from account does not exist", async () => {
    const client2 = new Client("client2", "Jane", "Smith", "jane@example.com", await bcrypt.hash("password", 10), true);
    await clientRepo.save(client2);

    const account2 = new Account("acc2", "client2", "FR7698765432109876543210987", "Compte 2", 500);
    await accountRepo.save(account2);

    await expect(
      transferFunds.execute("FR9999999999999999999999999", account2.iban, 100)
    ).rejects.toThrow("Compte expéditeur introuvable");
  });

  it("should throw error when amount is invalid", async () => {
    const client1 = new Client("client1", "John", "Doe", "john@example.com", await bcrypt.hash("password", 10), true);
    const client2 = new Client("client2", "Jane", "Smith", "jane@example.com", await bcrypt.hash("password", 10), true);
    await clientRepo.save(client1);
    await clientRepo.save(client2);

    const account1 = new Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 1000);
    const account2 = new Account("acc2", "client2", "FR7698765432109876543210987", "Compte 2", 500);
    await accountRepo.save(account1);
    await accountRepo.save(account2);

    await expect(
      transferFunds.execute(account1.iban, account2.iban, -100)
    ).rejects.toThrow("Montant invalide");

    await expect(
      transferFunds.execute(account1.iban, account2.iban, 0)
    ).rejects.toThrow("Montant invalide");
  });

  it("should throw error when trying to transfer to the same account", async () => {
    const client1 = new Client("client1", "John", "Doe", "john@example.com", await bcrypt.hash("password", 10), true);
    await clientRepo.save(client1);

    const account1 = new Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 1000);
    await accountRepo.save(account1);

    await expect(
      transferFunds.execute(account1.iban, account1.iban, 100)
    ).rejects.toThrow("Impossible de transférer vers le même compte");
  });

  it("should throw error when insufficient balance", async () => {
    const client1 = new Client("client1", "John", "Doe", "john@example.com", await bcrypt.hash("password", 10), true);
    const client2 = new Client("client2", "Jane", "Smith", "jane@example.com", await bcrypt.hash("password", 10), true);
    await clientRepo.save(client1);
    await clientRepo.save(client2);

    const account1 = new Account("acc1", "client1", "FR7612345678901234567890123", "Compte 1", 100);
    const account2 = new Account("acc2", "client2", "FR7698765432109876543210987", "Compte 2", 500);
    await accountRepo.save(account1);
    await accountRepo.save(account2);

    await expect(
      transferFunds.execute(account1.iban, account2.iban, 200)
    ).rejects.toThrow("Solde insuffisant");
  });
});

