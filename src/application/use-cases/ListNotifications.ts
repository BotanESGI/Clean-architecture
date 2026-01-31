import { Notification } from "../../domain/entities/Notification";
import { NotificationRepository } from "../repositories/NotificationRepository";

export class ListNotifications {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(receiverId: string): Promise<Notification[]> {
    return this.notificationRepo.findByReceiverId(receiverId);
  }
}
