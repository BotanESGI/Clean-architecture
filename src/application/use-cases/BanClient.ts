import { ClientRepository } from "../repositories/ClientRepository";

export class BanClient {
  constructor(private clientRepo: ClientRepository) {}

  async execute(clientId: string): Promise<void> {
    const client = await this.clientRepo.findById(clientId);
    if (!client) {
      throw new Error("Client introuvable");
    }

    if (client.getRole() === 'director') {
      throw new Error("Impossible de bannir un directeur");
    }

    if (client.getIsBanned()) {
      throw new Error("Client déjà banni");
    }

    client.ban();
    await this.clientRepo.update(client);
  }
}

