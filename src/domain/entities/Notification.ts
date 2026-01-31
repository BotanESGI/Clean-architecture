export class Notification {
  public readonly id: string;
  public readonly receiverId: string;
  public readonly senderId: string;
  public readonly title: string;
  public readonly message: string;
  public readonly isRead: boolean;
  public readonly createdAt: Date;

  constructor(
    id: string,
    receiverId: string,
    senderId: string,
    title: string,
    message: string,
    isRead: boolean = false,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.receiverId = receiverId;
    this.senderId = senderId;
    this.title = title;
    this.message = message;
    this.isRead = isRead;
    this.createdAt = createdAt;
  }

  markAsRead(): Notification {
    return new Notification(
      this.id,
      this.receiverId,
      this.senderId,
      this.title,
      this.message,
      true,
      this.createdAt
    );
  }
}
