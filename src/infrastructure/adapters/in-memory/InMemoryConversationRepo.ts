import { Conversation } from "../../../domain/entities/Conversation";
import { ConversationRepository } from "../../../application/repositories/ConversationRepository";

export class InMemoryConversationRepository implements ConversationRepository {
  private conversations = new Map<string, Conversation>();

  async save(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);
  }

  async findByClientId(clientId: string): Promise<Conversation | null> {
    for (const conversation of this.conversations.values()) {
      if (conversation.clientId === clientId) {
        return conversation;
      }
    }
    return null;
  }

  async findByAdvisorId(advisorId: string): Promise<Conversation[]> {
    const result: Conversation[] = [];
    for (const conversation of this.conversations.values()) {
      if (conversation.assignedAdvisorId === advisorId) {
        result.push(conversation);
      }
    }
    // Trier par date de mise à jour (plus récent en premier)
    result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return result;
  }

  async findPendingConversations(): Promise<Conversation[]> {
    const result: Conversation[] = [];
    for (const conversation of this.conversations.values()) {
      if (conversation.isPending()) {
        result.push(conversation);
      }
    }
    // Trier par date de création (plus récent en premier)
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return result;
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }
}

