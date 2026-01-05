export class PrivateMessage {
  constructor(
    public readonly id: string,
    public readonly senderId: string,
    public readonly receiverId: string,
    public readonly content: string,
    public readonly createdAt: Date = new Date(),
    public readonly isRead: boolean = false
  ) {}

  markAsRead(): PrivateMessage {
    return new PrivateMessage(
      this.id,
      this.senderId,
      this.receiverId,
      this.content,
      this.createdAt,
      true
    );
  }
}

