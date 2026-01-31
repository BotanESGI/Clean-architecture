import { Notification } from "../../domain/entities/Notification";

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findByReceiverId(receiverId: string): Promise<Notification[]>;
  findById(id: string): Promise<Notification | null>;
  countUnread(receiverId: string): Promise<number>;
  update(notification: Notification): Promise<void>;
}
