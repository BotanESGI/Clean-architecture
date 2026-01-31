import { NotificationRepository } from "../repositories/NotificationRepository";

export class GetUnreadNotificationCount {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(receiverId: string): Promise<number> {
    return this.notificationRepo.countUnread(receiverId);
  }
}
