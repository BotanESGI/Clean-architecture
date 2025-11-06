import { ClientRepository } from "../repositories/ClientRepository";

export class UnbanClient {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(clientId: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new Error("Client introuvable");
    
    if (!client.getIsBanned()) throw new Error("Client non banni");
    
    client.setIsBanned(false);
    await this.clientRepository.update(client);
  }
}

