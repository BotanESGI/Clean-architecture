export class Conversation {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly assignedAdvisorId: string | null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  assignAdvisor(advisorId: string): Conversation {
    return new Conversation(
      this.id,
      this.clientId,
      advisorId,
      this.createdAt,
      new Date()
    );
  }

  isPending(): boolean {
    return this.assignedAdvisorId === null;
  }

  isAssignedTo(advisorId: string): boolean {
    return this.assignedAdvisorId === advisorId;
  }
}

