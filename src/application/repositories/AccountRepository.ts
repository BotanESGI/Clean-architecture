import { Account } from "../../domain/entities/Account";

export interface AccountRepository {
    create(account: Account): Promise<void>;
    findByIban(iban: string): Promise<Account | null>;
    findById(id: string): Promise<Account | null>;
    findByOwnerId(ownerId: string): Promise<Account[]>;
    update(account: Account): Promise<void>;
    delete(iban: string): Promise<void>;
    listAll(): Promise<Account[]>;
}
