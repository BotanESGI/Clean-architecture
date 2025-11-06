import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Client } from "../../domain/entities/Client";
import { ClientRepository } from "../repositories/ClientRepository";
import { AccountRepository } from "../repositories/AccountRepository";
import { Account } from "../../domain/entities/Account";
import { IBAN } from "../../domain/value-objects/IBAN";

export class CreateClientByDirector {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  async execute(
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string
  ): Promise<{ client: Client; account: Account }> {
    const existing = await this.clientRepository.findByEmail(email);
    if (existing) throw new Error("Email déjà utilisé");

    const passwordHash = await bcrypt.hash(password, 10);
    const client = new Client(
      crypto.randomUUID(),
      firstName,
      lastName,
      email,
      passwordHash,
      true, // Directement vérifié
      [],
      'CLIENT',
      false
    );

    await this.clientRepository.save(client);

    // Créer automatiquement un compte bancaire
    const iban = IBAN.generateFR();
    const account = new Account(
      crypto.randomUUID(),
      client.getId(),
      iban,
      "Compte courant",
      0
    );
    await this.accountRepository.create(account);

    client.addAccountId(account.id);
    await this.clientRepository.update(client);

    return { client, account };
  }
}

