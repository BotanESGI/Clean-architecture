import { ClientRepository } from "../repositories/ClientRepository";

export class UnbanClient {
  constructor(private clientRepo: ClientRepository) {}

  async execute(clientId: string): Promise<void> {
    const client = await this.clientRepo.findById(clientId);
    if (!client) {
      throw new Error("Client introuvable");
    }

    if (!client.getIsBanned()) {
      throw new Error("Client non banni");
    }

    client.unban();
    await this.clientRepo.update(client);
  }
}

