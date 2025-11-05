import jwt, { SignOptions } from "jsonwebtoken";
import { Client } from "../../domain/entities/Client";
import { ClientRepository } from "../repositories/ClientRepository";
import bcrypt from "bcryptjs";
import { EmailService } from "../services/EmailService"; 
import crypto from "crypto";

export class RegisterClient {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(firstName: string, lastName: string, email: string, password: string): Promise<Client> {
    const existing = await this.clientRepository.findByEmail(email);
    console.log("Existing client:", existing);
    if (existing) throw new Error("Email déjà utilisé");

    
    const policy = {
      minLen: 8,
      upper: /[A-Z]/,
      lower: /[a-z]/,
      digit: /\d/,
      special: /[^A-Za-z0-9]/,
    };
    if (
      !password ||
      password.length < policy.minLen ||
      !policy.upper.test(password) ||
      !policy.lower.test(password) ||
      !policy.digit.test(password) ||
      !policy.special.test(password)
    ) {
      throw new Error(
        "Mot de passe invalide. Exigences: 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial."
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const client = new Client(
      crypto.randomUUID(),
      firstName,
      lastName,
      email,
      passwordHash,
      'client', // role
      false,    // isBanned
      false     // isVerified
    );

    await this.clientRepository.save(client);

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET non défini dans .env");

    const payload = { clientId: client.getId() };
    const expiresInEnv = process.env.JWT_EXPIRES_IN;
    const options: SignOptions = { expiresIn: expiresInEnv ? (expiresInEnv as jwt.SignOptions["expiresIn"]) : "1d" };
    

    const token = jwt.sign(payload, secret as jwt.Secret, options);

    await this.emailService.sendConfirmationEmail(email, token);

    return client;
  }
}
