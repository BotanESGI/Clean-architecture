import { ClientRepository } from "../repositories/ClientRepository";
import { Client } from "../../domain/entities/Client";

export class GetAvailableAdvisor {
  constructor(private readonly clientRepo: ClientRepository) {}

  async execute(): Promise<Client> {
    // Trouver le premier conseiller disponible
    // Pour simplifier, on prend le conseiller avec l'ID fixe "advisor-001"
    // ou on peut lister tous les conseillers et en prendre un
    const advisor = await this.clientRepo.findById("advisor-001");
    
    if (!advisor || advisor.getRole() !== "ADVISOR") {
      throw new Error("Aucun conseiller disponible");
    }

    return advisor;
  }
}


