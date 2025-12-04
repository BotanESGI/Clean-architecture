// Version refactorisée avec Result au lieu de throw
// Plus facile à tester et les erreurs sont explicites

import jwt, { SignOptions } from "jsonwebtoken";
import { Client } from "../../domain/entities/Client";
import { ClientRepository } from "../repositories/ClientRepository";
import bcrypt from "bcryptjs";
import { EmailService } from "../services/EmailService";
import crypto from "crypto";
import { Result, success, failure } from "../../domain/value-objects/Result";
import { validatePassword, PasswordValidationError } from "../../domain/utils/passwordValidator";

export class RegisterClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegisterClientError";
  }
}

export class RegisterClient {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<Result<Client, RegisterClientError | PasswordValidationError>> {
    // Vérifier si l'email existe déjà
    const existingClient = await this.clientRepository.findByEmail(email);
    if (existingClient) {
      return failure(
        new RegisterClientError("Email déjà utilisé")
      );
    }

    // Valider le mot de passe
    const passwordValidation = validatePassword(password);
    if (passwordValidation.isFailure) {
      return passwordValidation;
    }

    // Check si JWT_SECRET est défini
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return failure(
        new RegisterClientError("JWT_SECRET non défini dans .env")
      );
    }

    // Hash le mot de passe
    const passwordHash = await bcrypt.hash(passwordValidation.value, 10);

    // Créer le nouveau client
    const client = new Client(
      crypto.randomUUID(),
      firstName,
      lastName,
      email,
      passwordHash,
      false,
      [],
      'CLIENT',
      false
    );

    await this.clientRepository.save(client);

    // Générer le token pour la confirmation
    const expiresInEnv = process.env.JWT_EXPIRES_IN;
    const expiresIn: SignOptions["expiresIn"] = expiresInEnv 
      ? (expiresInEnv as SignOptions["expiresIn"]) 
      : "1d";
    
    const payload = { clientId: client.getId() };
    const token = jwt.sign(payload, secret as jwt.Secret, { expiresIn });

    // Envoyer l'email de confirmation
    await this.emailService.sendConfirmationEmail(email, token);

    return success(client);
  }
}

