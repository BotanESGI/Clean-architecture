import { ClientRepository } from "../repositories/ClientRepository";

interface UpdateClientDTO {
  clientId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class UpdateClient {
  constructor(private clientRepo: ClientRepository) {}

  async execute(dto: UpdateClientDTO): Promise<void> {
    const client = await this.clientRepo.findById(dto.clientId);
    if (!client) {
      throw new Error("Client introuvable");
    }

    // Vérifier si l'email existe déjà
    if (dto.email && dto.email !== client.getEmail()) {
      const existingClient = await this.clientRepo.findByEmail(dto.email);
      if (existingClient) {
        throw new Error("Email déjà utilisé");
      }
      client.setEmail(dto.email);
    }

    if (dto.firstName) {
      if (dto.firstName.trim().length < 2) {
        throw new Error("Prénom invalide (minimum 2 caractères)");
      }
      client.setFirstName(dto.firstName.trim());
    }

    if (dto.lastName) {
      if (dto.lastName.trim().length < 2) {
        throw new Error("Nom invalide (minimum 2 caractères)");
      }
      client.setLastName(dto.lastName.trim());
    }

    await this.clientRepo.update(client);
  }
}

