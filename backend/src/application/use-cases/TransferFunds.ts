import { AccountRepository } from "../ports/AccountRepository";

export class TransferFunds {
    constructor(private repo: AccountRepository) {}

    async execute(fromIban: string, toIban: string, amount: number) {
        const from = await this.repo.findByIban(fromIban);
        const to = await this.repo.findByIban(toIban);
        if (!from || !to) throw new Error("Account not found");
        if (amount <= 0) throw new Error("Invalid amount");
        from.debit(amount);
        to.credit(amount);
        await this.repo.update(from);
        await this.repo.update(to);
        return { success: true, fromBalance: from.balance, toBalance: to.balance };
    }
}
