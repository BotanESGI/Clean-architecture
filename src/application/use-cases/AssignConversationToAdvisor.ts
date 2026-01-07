import { ConversationRepository } from "../repositories/ConversationRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import crypto from "crypto";

export class AssignConversationToAdvisor {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly clientRepo: ClientRepository
  ) {}

  async execute(clientId: string, advisorId: string): Promise<void> {
    // Vérifier que le conseiller existe et est bien un conseiller
    const advisor = await this.clientRepo.findById(advisorId);
    if (!advisor || advisor.getRole() !== "ADVISOR") {
      throw new Error("Le conseiller est introuvable ou n'est pas un conseiller");
    }

    // Récupérer ou créer la conversation
    let conversation = await this.conversationRepo.findByClientId(clientId);
    
    if (!conversation) {
      // Si la conversation n'existe pas, elle sera créée par GetOrCreateConversation
      // Mais pour simplifier, on la crée ici directement
      const { Conversation } = await import("../../domain/entities/Conversation");
      conversation = new Conversation(
        crypto.randomUUID(),
        clientId,
        null,
        new Date(),
        new Date()
      );
    }

    // Si la conversation est déjà assignée, ne pas la réassigner
    if (conversation.assignedAdvisorId !== null && conversation.assignedAdvisorId !== advisorId) {
      // La conversation est déjà assignée à un autre conseiller
      return;
    }

    // Assigner la conversation au conseiller (seulement si elle n'est pas déjà assignée)
    if (conversation.assignedAdvisorId === null) {
      const updatedConversation = conversation.assignAdvisor(advisorId);
      await this.conversationRepo.save(updatedConversation);
    }
  }
}

