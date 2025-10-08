import { AccountRepository } from "../../../application/ports/AccountRepository";
import { Account } from "../../../domain/entities/Account";

export class InMemoryAccountRepo implements AccountRepository {
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

    listAll() {
        return Array.from(this.accounts.values());
    }
}
