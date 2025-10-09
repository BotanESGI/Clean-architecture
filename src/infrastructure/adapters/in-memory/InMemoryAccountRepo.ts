import { AccountRepository } from "../../../application/repositories/AccountRepository";
import { Account } from "../../../domain/entities/Account";

export class InMemoryAccountRepository implements AccountRepository {
    private accounts = new Map<string, Account>();

    async create(account: Account) {
        this.accounts.set(account.iban, account);
    }

    async findByIban(iban: string) {
        return this.accounts.get(iban) ?? null;
    }

    async update(account: Account) {
        this.accounts.set(account.iban, account);
    }
    async findById(id: string): Promise<Account | null> {
        for (const account of this.accounts.values()) {
            if (account.id === id) {
                return account;
            }
        }
        return null;
    }

    async findByOwnerId(ownerId: string): Promise<Account[]> {
        const result: Account[] = [];
        for (const account of this.accounts.values()) {
            if (account.ownerId === ownerId) {
                result.push(account);
            }
        }
        return result;
    }

    async delete(iban: string): Promise<void> {
        this.accounts.delete(iban);
    }

    async listAll(): Promise<Account[]> {
        return Array.from(this.accounts.values());
    }
}
