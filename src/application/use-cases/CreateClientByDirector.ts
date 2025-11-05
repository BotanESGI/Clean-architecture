import { ClientRepository } from "../repositories/ClientRepository";
import { AccountRepository } from "../repositories/AccountRepository";
import { Client } from "../../domain/entities/Client";
import { Account } from "../../domain/entities/Account";
import { IBAN } from "../../domain/value-objects/IBAN";
import { randomUUID } from "crypto";
import * as bcrypt from "bcryptjs";

interface CreateClientDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'client' | 'advisor';
}

export class CreateClientByDirector {
  constructor(
    private clientRepo: ClientRepository,
    private accountRepo: AccountRepository
  ) {}

  async execute(dto: CreateClientDTO): Promise<{ clientId: string; accountId: string }> {
    // Validation
    if (!dto.email || !dto.email.includes("@")) {
      throw new Error("Email invalide");
    }
    
    if (!dto.password || dto.password.length < 8) {
      throw new Error("Mot de passe trop court (minimum 8 caractères)");
    }

    if (!dto.firstName || dto.firstName.trim().length < 2) {
      throw new Error("Prénom invalide");
    }

    if (!dto.lastName || dto.lastName.trim().length < 2) {
      throw new Error("Nom invalide");
    }

    // Vérifier si l'email existe déjà
    const existing = await this.clientRepo.findByEmail(dto.email);
    if (existing) {
      throw new Error("Email déjà utilisé");
    }

    // Créer le client
    const clientId = randomUUID();
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const client = new Client(
      clientId,
      dto.firstName.trim(),
      dto.lastName.trim(),
      dto.email,
      hashedPassword,
      dto.role || 'client',
      false, // isBanned
      true,  // isVerified (créé par le directeur, donc déjà vérifié)
      []     // accountIds
    );

    await this.clientRepo.save(client);

    // Créer automatiquement un compte pour le client
    const accountId = randomUUID();
    const iban = IBAN.generate("FR");
    const account = new Account(accountId, clientId, iban, "Compte courant", 0, false);
    await this.accountRepo.save(account);

    // Ajouter l'ID du compte au client
    client.addAccountId(accountId);
    await this.clientRepo.update(client);

    return { clientId, accountId };
  }
}

