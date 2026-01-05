import jwt from "jsonwebtoken";
import { ClientRepository } from "../repositories/ClientRepository";
import { AccountRepository } from "../repositories/AccountRepository";
import { Account } from "../../domain/entities/Account";
import { IBAN } from "../../domain/value-objects/IBAN";
import crypto from "crypto";

export class ConfirmClientRegistration {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(token: string): Promise<Account> {
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string };
    } catch (err) {
      throw new Error("Token invalide ou expiré");
    }
  
    const clientId = payload.clientId;
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new Error("Client introuvable");
    if (client.getIsVerified()) throw new Error("Compte déjà confirmé");
  
    client.setIsVerified(true);
    await this.clientRepository.update(client);
  
    const iban = IBAN.generateFR();
    const account = new Account(
      crypto.randomUUID(),
      client.getId(),
      iban,
      "Compte courant",
      0,
      false,
      "checking"
    );
    await this.accountRepository.create(account);
  
    client.addAccountId(account.id);
    await this.clientRepository.update(client);
  
    return account;
  }
  
}
