import { AccountRepository } from "../repositories/AccountRepository";

export class CloseAccount {
  constructor(private repo: AccountRepository) {}

  async execute(id: string) {
    const acc = await this.repo.findById(id);
    if (!acc) throw new Error("Compte introuvable");
    acc.close();
    await this.repo.update(acc);
    return { success: true };
  }
}
