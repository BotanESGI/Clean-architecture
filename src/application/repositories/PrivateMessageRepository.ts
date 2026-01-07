import { PrivateMessage } from "../../domain/entities/PrivateMessage";

export interface PrivateMessageRepository {
  save(message: PrivateMessage): Promise<void>;
  findByConversation(clientId: string, advisorId: string): Promise<PrivateMessage[]>;
  findByClientId(clientId: string): Promise<PrivateMessage[]>; // Récupère tous les messages d'un client (conversations non assignées)
  findById(id: string): Promise<PrivateMessage | null>;
  markAsRead(messageId: string): Promise<void>;
  getUnreadCount(receiverId: string): Promise<number>;
  findAllByReceiver(receiverId: string): Promise<PrivateMessage[]>;
}

