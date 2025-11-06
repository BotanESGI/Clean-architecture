import { Client } from "../../domain/entities/Client";

export interface ClientRepository {
  save(client: Client): Promise<void>;
  update(client: Client): Promise<void>;
  findById(id: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
  delete(id: string): Promise<void>;
}