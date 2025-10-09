// application/use-cases/ConfirmClientRegistration.ts
import { ClientRepository } from "../repositories/ClientRepository";
import { AccountRepository } from "../repositories/AccountRepository";
import { Account } from "../../domain/entities/Account";
import { IBAN } from "../../domain/value-objects/IBAN";

export class ConfirmClientRegistration {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(clientId: string): Promise<Account> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new Error("Client introuvable");
    if (client.getIsVerified() === true) throw new Error("Compte déjà confirmé");

    client.setIsVerified(true);
    await this.clientRepository.update(client);

    const iban = IBAN.generateFR();
    const account = new Account(crypto.randomUUID(), client.getId(), iban);
    await this.accountRepository.create(account);

    return account;
  }
}
