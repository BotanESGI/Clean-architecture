import crypto from "crypto";
import { AccountRepository } from "../repositories/AccountRepository";
import { Account } from "../../domain/entities/Account";
import { IBAN } from "../../domain/value-objects/IBAN";

export class CreateAccount {
  constructor(private repo: AccountRepository) {}

  async execute(params: { ownerId: string; name?: string; type?: "checking" | "savings" }) {
    const iban = IBAN.generateFR();
    const accountType = params.type || "checking";
    const defaultName = accountType === "savings" ? "Compte d'épargne" : "Compte courant";
    const account = new Account(
      crypto.randomUUID(),
      params.ownerId,
      iban,
      params.name ?? defaultName,
      0,
      false,
      accountType
    );
    await this.repo.create(account);
    return account;
  }
}
