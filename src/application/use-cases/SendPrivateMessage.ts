import { PrivateMessage } from "../../domain/entities/PrivateMessage";
import { PrivateMessageRepository } from "../repositories/PrivateMessageRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { GetOrCreateConversation } from "./GetOrCreateConversation";
import { AssignConversationToAdvisor } from "./AssignConversationToAdvisor";
import crypto from "crypto";

export class SendPrivateMessage {
  private getOrCreateConversation: GetOrCreateConversation;
  private assignConversation: AssignConversationToAdvisor;

  constructor(
    private readonly messageRepo: PrivateMessageRepository,
    private readonly clientRepo: ClientRepository,
    private readonly conversationRepo: ConversationRepository
  ) {
    this.getOrCreateConversation = new GetOrCreateConversation(conversationRepo, clientRepo);
    this.assignConversation = new AssignConversationToAdvisor(conversationRepo, clientRepo);
  }

  async execute(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<PrivateMessage> {
    // Vérifier que le sender existe
    const sender = await this.clientRepo.findById(senderId);
    if (!sender) {
      throw new Error("Expéditeur introuvable");
    }

    // Vérifier que le receiver existe
    const receiver = await this.clientRepo.findById(receiverId);
    if (!receiver) {
      throw new Error("Destinataire introuvable");
    }

    // Vérifier qu'au moins un des deux est un conseiller
    const senderRole = sender.getRole();
    const receiverRole = receiver.getRole();
    
    if (senderRole !== "ADVISOR" && receiverRole !== "ADVISOR") {
      throw new Error("Les discussions privées sont uniquement entre clients et conseillers");
    }

    // Vérifier qu'un client ne peut pas contacter un autre client
    if (senderRole === "CLIENT" && receiverRole === "CLIENT") {
      throw new Error("Les clients ne peuvent pas se contacter directement");
    }

    // Valider le contenu
    if (!content || content.trim().length === 0) {
      throw new Error("Le message ne peut pas être vide");
    }

    if (content.length > 1000) {
      throw new Error("Le message ne peut pas dépasser 1000 caractères");
    }

    const isSenderClient = senderRole === "CLIENT";
    const isReceiverClient = receiverRole === "CLIENT";
    const clientId = isSenderClient ? senderId : receiverId;
    const advisorId = isSenderClient ? receiverId : senderId;

    if (isSenderClient) {
      await this.getOrCreateConversation.execute(clientId);
    }

    if (isReceiverClient && senderRole === "ADVISOR") {
      const conversation = await this.conversationRepo.findByClientId(clientId);
      if (conversation && conversation.isPending()) {
        await this.assignConversation.execute(clientId, advisorId);
      }
    }

    const message = new PrivateMessage(
      crypto.randomUUID(),
      senderId,
      receiverId,
      content.trim(),
      new Date(),
      false
    );

    await this.messageRepo.save(message);
    return message;
  }
}


