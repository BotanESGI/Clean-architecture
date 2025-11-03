import { AccountRepository } from "../repositories/AccountRepository";

export class RenameAccount {
  constructor(private repo: AccountRepository) {}

  async execute(id: string, name: string) {
    if (!name || name.trim().length < 2) throw new Error("Nom invalide");
    const acc = await this.repo.findById(id);
    if (!acc) throw new Error("Compte introuvable");
    acc.rename(name.trim());
    await this.repo.update(acc);
    return acc;
  }
}
