import { ClientRepository } from "../repositories/ClientRepository";
import { Client } from "../../domain/entities/Client";

export class ListAllClients {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(): Promise<Client[]> {
    return await this.clientRepository.findAll();
  }
}

