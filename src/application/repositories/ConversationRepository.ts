import { Conversation } from "../../domain/entities/Conversation";

export interface ConversationRepository {
  save(conversation: Conversation): Promise<void>;
  findByClientId(clientId: string): Promise<Conversation | null>;
  findByAdvisorId(advisorId: string): Promise<Conversation[]>;
  findPendingConversations(): Promise<Conversation[]>;
  findById(id: string): Promise<Conversation | null>;
}

