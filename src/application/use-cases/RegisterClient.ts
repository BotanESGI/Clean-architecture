import { Client } from "../../domain/entities/Client";
import { ClientRepository } from "../repositories/ClientRepository";
import bcrypt from 'bcryptjs';
import { EmailService } from "../services/EmailService";

export class RegisterClient {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(firstname: string, lastname:string, email: string, password: string): Promise<Client> {
    const existing = await this.clientRepository.findByEmail(email);
    if (existing) throw new Error("Email déjà utilisé");

    const passwordHash = await bcrypt.hash(password, 10);
    const client = new Client(crypto.randomUUID(), firstname, lastname, email, passwordHash, false);

    await this.clientRepository.save(client);
   await this.emailService.sendConfirmationEmail(email, client.getId());

    return client;
  }
}
