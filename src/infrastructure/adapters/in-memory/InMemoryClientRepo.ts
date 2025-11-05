import { ClientRepository } from "../../../application/repositories/ClientRepository";
import { Client } from "../../../domain/entities/Client";

export class InMemoryClientRepository implements ClientRepository {
  private clients: Client[] = [];

  async save(client: Client): Promise<void> {
    this.clients.push(client);
  }

  async update(client: Client): Promise<void> {
    const index = this.clients.findIndex(c => c.getId() === client.getId());
    if (index !== -1) this.clients[index] = client;
  }

  async findById(id: string): Promise<Client | null> {
    return this.clients.find(c => c.getId() === id) ?? null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.clients.find(c => c.getEmail() === email) ?? null;
  }

  async findAll(): Promise<Client[]> {
    return this.clients;
  }

  async delete(id: string): Promise<void> {
    this.clients = this.clients.filter(c => c.getId() !== id);
  }
}
