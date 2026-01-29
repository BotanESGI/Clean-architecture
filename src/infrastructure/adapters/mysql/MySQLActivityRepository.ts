import { DataSource, Repository } from "typeorm";
import { ActivityRepository } from "../../../application/repositories/ActivityRepository";
import { Activity } from "../../../domain/entities/Activity";
import { ActivityEntity } from "./entities/ActivityEntity";

export class MySQLActivityRepository implements ActivityRepository {
  private repo: Repository<ActivityEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(ActivityEntity);
  }

  async save(activity: Activity): Promise<void> {
    const entity = this.toEntity(activity);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Activity | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findPublished(): Promise<Activity[]> {
    const entities = await this.repo.find({
      where: { isPublished: true },
      order: { createdAt: "DESC" },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<Activity[]> {
    const entities = await this.repo.find({ order: { createdAt: "DESC" } });
    return entities.map((e) => this.toDomain(e));
  }

  private toEntity(activity: Activity): ActivityEntity {
    const entity = new ActivityEntity();
    entity.id = activity.id;
    entity.title = activity.title;
    entity.content = activity.content;
    entity.authorId = activity.authorId;
    entity.createdAt = activity.createdAt;
    entity.isPublished = activity.isPublished;
    return entity;
  }

  private toDomain(entity: ActivityEntity): Activity {
    return new Activity(
      entity.id,
      entity.title,
      entity.content,
      entity.authorId,
      entity.createdAt,
      entity.isPublished
    );
  }
}
