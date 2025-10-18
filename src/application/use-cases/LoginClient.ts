import { ClientRepository } from "../repositories/ClientRepository";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export class LoginClient {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(email: string, password: string): Promise<string> {
    const client = await this.clientRepository.findByEmail(email);
    if (!client) throw new Error("Email ou mot de passe invalide");

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, client.getPasswordHash());
    if (!isPasswordValid) throw new Error("Email ou mot de passe invalide");

    // Vérification que le compte est confirmé
    if (!client.getIsVerified()) throw new Error("Compte non vérifié. Merci de confirmer votre email.");

    // Génération d’un JWT pour la session
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET non défini");

    const payload = { clientId: client.getId() };
    const expiresInEnv = process.env.JWT_EXPIRES_IN;
    const options: SignOptions = { expiresIn: expiresInEnv ? (expiresInEnv as jwt.SignOptions["expiresIn"]) : "1d" };
    const token = jwt.sign(payload, secret, options);

    return token;
  }
}
