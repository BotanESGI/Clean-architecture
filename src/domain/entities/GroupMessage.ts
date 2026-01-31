export class GroupMessage {
  constructor(
    public readonly id: string,
    public readonly senderId: string,
    public readonly senderRole: string,
    public readonly senderName: string,
    public readonly content: string,
    public readonly createdAt: Date = new Date()
  ) {}
}
