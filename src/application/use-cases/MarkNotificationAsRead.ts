import { NotificationRepository } from "../repositories/NotificationRepository";

export class MarkNotificationAsRead {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(notificationId: string, receiverId: string): Promise<void> {
    const notification = await this.notificationRepo.findById(notificationId);
    
    if (!notification) {
      throw new Error("Notification introuvable");
    }

    if (notification.receiverId !== receiverId) {
      throw new Error("Vous n'êtes pas autorisé à modifier cette notification");
    }

    if (notification.isRead) {
      return; // Déjà lue
    }

    const updatedNotification = notification.markAsRead();
    await this.notificationRepo.update(updatedNotification);
  }
}
