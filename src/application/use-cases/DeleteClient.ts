import { ClientRepository } from "../repositories/ClientRepository";

export class DeleteClient {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(clientId: string): Promise<void> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new Error("Client introuvable");
    
    await this.clientRepository.delete(clientId);
  }
}

