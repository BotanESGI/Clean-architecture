import { DataSource, Repository } from "typeorm";
import { Notification } from "../../../domain/entities/Notification";
import { NotificationRepository } from "../../../application/repositories/NotificationRepository";
import { NotificationEntity } from "./entities/NotificationEntity";

export class MySQLNotificationRepository implements NotificationRepository {
  private repo: Repository<NotificationEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(NotificationEntity);
  }

  async save(notification: Notification): Promise<void> {
    const entity = this.toEntity(notification);
    await this.repo.save(entity);
  }

  async findByReceiverId(receiverId: string): Promise<Notification[]> {
    const entities = await this.repo.find({
      where: { receiverId },
      order: { createdAt: "DESC" },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<Notification | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async countUnread(receiverId: string): Promise<number> {
    return this.repo.count({
      where: { receiverId, isRead: false },
    });
  }

  async update(notification: Notification): Promise<void> {
    const entity = this.toEntity(notification);
    await this.repo.save(entity);
  }

  private toEntity(notification: Notification): NotificationEntity {
    const entity = new NotificationEntity();
    entity.id = notification.id;
    entity.receiverId = notification.receiverId;
    entity.senderId = notification.senderId;
    entity.title = notification.title;
    entity.message = notification.message;
    entity.isRead = notification.isRead;
    entity.createdAt = notification.createdAt;
    return entity;
  }

  private toDomain(entity: NotificationEntity): Notification {
    return new Notification(
      entity.id,
      entity.receiverId,
      entity.senderId,
      entity.title,
      entity.message,
      entity.isRead,
      entity.createdAt
    );
  }
}
