import { Account } from "../../domain/entities/Account";

export interface AccountRepository {
    create(account: Account): Promise<void>;
    findByIban(iban: string): Promise<Account | null>;
    update(account: Account): Promise<void>;
}
