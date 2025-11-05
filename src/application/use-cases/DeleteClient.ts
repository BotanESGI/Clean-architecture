import { ClientRepository } from "../repositories/ClientRepository";
import { AccountRepository } from "../repositories/AccountRepository";

export class DeleteClient {
  constructor(
    private clientRepo: ClientRepository,
    private accountRepo: AccountRepository
  ) {}

  async execute(clientId: string): Promise<void> {
    const client = await this.clientRepo.findById(clientId);
    if (!client) {
      throw new Error("Client introuvable");
    }

    if (client.getRole() === 'director') {
      throw new Error("Impossible de supprimer un directeur");
    }

    // Supprimer tous les comptes du client
    const accountIds = client.getAccountIds();
    for (const accountId of accountIds) {
      const account = await this.accountRepo.findById(accountId);
      if (account) {
        // On force la fermeture même si le solde n'est pas nul
        await this.accountRepo.delete(accountId);
      }
    }

    // Supprimer le client
    await this.clientRepo.delete(clientId);
  }
}

