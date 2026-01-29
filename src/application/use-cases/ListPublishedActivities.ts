import { ActivityRepository } from "../repositories/ActivityRepository";

export class ListPublishedActivities {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async execute(): Promise<{ id: string; title: string; content: string; authorId: string; createdAt: Date }[]> {
    const activities = await this.activityRepository.findPublished();
    return activities.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      authorId: a.authorId,
      createdAt: a.createdAt,
    }));
  }
}
