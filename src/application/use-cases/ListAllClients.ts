import { ClientRepository } from "../repositories/ClientRepository";
import { Client } from "../../domain/entities/Client";

export class ListAllClients {
  constructor(private clientRepo: ClientRepository) {}

  async execute(): Promise<Client[]> {
    return await this.clientRepo.findAll();
  }
}

