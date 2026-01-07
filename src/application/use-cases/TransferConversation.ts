import { ConversationRepository } from "../repositories/ConversationRepository";
import { ClientRepository } from "../repositories/ClientRepository";

export class TransferConversation {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly clientRepo: ClientRepository
  ) {}

  async execute(
    clientId: string,
    fromAdvisorId: string,
    toAdvisorId: string
  ): Promise<void> {
    // Vérifier que les deux conseillers existent et sont bien des conseillers
    const fromAdvisor = await this.clientRepo.findById(fromAdvisorId);
    if (!fromAdvisor || fromAdvisor.getRole() !== "ADVISOR") {
      throw new Error("Le conseiller source est introuvable ou n'est pas un conseiller");
    }

    const toAdvisor = await this.clientRepo.findById(toAdvisorId);
    if (!toAdvisor || toAdvisor.getRole() !== "ADVISOR") {
      throw new Error("Le conseiller destination est introuvable ou n'est pas un conseiller");
    }

    // Vérifier que le client existe
    const client = await this.clientRepo.findById(clientId);
    if (!client || client.getRole() !== "CLIENT") {
      throw new Error("Le client est introuvable");
    }

    // Récupérer la conversation
    const conversation = await this.conversationRepo.findByClientId(clientId);
    if (!conversation) {
      throw new Error("Conversation introuvable pour ce client");
    }

    // Vérifier que la conversation est bien assignée au conseiller source
    if (!conversation.isAssignedTo(fromAdvisorId)) {
      throw new Error("Cette conversation n'est pas assignée au conseiller source");
    }

    // Vérifier qu'on ne transfère pas à soi-même
    if (fromAdvisorId === toAdvisorId) {
      throw new Error("Impossible de transférer une conversation à soi-même");
    }

    // Transférer la conversation
    const updatedConversation = conversation.assignAdvisor(toAdvisorId);
    await this.conversationRepo.save(updatedConversation);
  }
}

