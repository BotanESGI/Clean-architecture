import { ClientRepository } from "../repositories/ClientRepository";

export class UpdateClientInfo {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(
    clientId: string, 
    data: { firstName?: string; lastName?: string; email?: string }
  ): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new Error("Client introuvable");

    if (data.firstName) client.setFirstName(data.firstName);
    if (data.lastName) client.setLastName(data.lastName);
    if (data.email) {
      const existing = await this.clientRepository.findByEmail(data.email);
      if (existing && existing.getId() !== clientId) {
        throw new Error("Email déjà utilisé");
      }
      client.setEmail(data.email);
    }

    await this.clientRepository.update(client);
  }
}

