import { Conversation } from "../../domain/entities/Conversation";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import crypto from "crypto";

export class GetOrCreateConversation {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly clientRepo: ClientRepository
  ) {}

  async execute(clientId: string): Promise<Conversation> {
    // Vérifier que le client existe
    const client = await this.clientRepo.findById(clientId);
    if (!client) {
      throw new Error("Client introuvable");
    }

    if (client.getRole() !== "CLIENT") {
      throw new Error("Le clientId doit correspondre à un client");
    }

    // Chercher une conversation existante
    let conversation = await this.conversationRepo.findByClientId(clientId);

    // Si aucune conversation n'existe, en créer une (sans conseiller assigné)
    if (!conversation) {
      conversation = new Conversation(
        crypto.randomUUID(),
        clientId,
        null, // Pas encore assigné
        new Date(),
        new Date()
      );
      await this.conversationRepo.save(conversation);
    }

    return conversation;
  }
}

