import { PrivateMessageRepository } from "../repositories/PrivateMessageRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { PrivateMessage } from "../../domain/entities/PrivateMessage";

export interface ConversationSummary {
  clientId: string;
  clientName: string;
  clientEmail: string;
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
  isPending: boolean;
  assignedAdvisorId: string | null;
}

export class ListAdvisorConversations {
  constructor(
    private readonly messageRepo: PrivateMessageRepository,
    private readonly clientRepo: ClientRepository,
    private readonly conversationRepo: ConversationRepository
  ) {}

  async execute(advisorId: string): Promise<ConversationSummary[]> {
    const advisor = await this.clientRepo.findById(advisorId);
    if (!advisor || advisor.getRole() !== "ADVISOR") {
      throw new Error("Conseiller introuvable");
    }

    const assignedConversations = await this.conversationRepo.findByAdvisorId(advisorId);
    const pendingConversations = await this.conversationRepo.findPendingConversations();

    const allConversations = [...assignedConversations, ...pendingConversations];
    const summaries: ConversationSummary[] = [];

    for (const conversation of allConversations) {
      const client = await this.clientRepo.findById(conversation.clientId);
      if (!client || client.getRole() !== "CLIENT") continue;

      const allClientMessages = await this.messageRepo.findByClientId(conversation.clientId);
      const messages: PrivateMessage[] = [];
      for (const msg of allClientMessages) {
        const otherUserId = msg.senderId === conversation.clientId ? msg.receiverId : msg.senderId;
        if (otherUserId !== conversation.clientId) {
          const otherUser = await this.clientRepo.findById(otherUserId);
          if (otherUser && otherUser.getRole() === "ADVISOR") {
            messages.push(msg);
          }
        }
      }

      if (messages.length === 0) continue;

      messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const lastMessage = messages[0];
      const unreadCount = messages.filter(m => 
        !m.isRead && 
        m.senderId !== advisorId &&
        m.createdAt <= new Date()
      ).length;

      const isPending = conversation.isPending();
      const isAssignedToMe = conversation.isAssignedTo(advisorId);

      if (isAssignedToMe || isPending) {
        summaries.push({
          clientId: conversation.clientId,
          clientName: `${client.getFirstName()} ${client.getLastName()}`,
          clientEmail: client.getEmail() || "",
          lastMessage: lastMessage.content,
          lastMessageDate: lastMessage.createdAt,
          unreadCount,
          isPending,
          assignedAdvisorId: conversation.assignedAdvisorId,
        });
      }
    }

    summaries.sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());

    return summaries;
  }
}

