import { DataSource, Repository } from "typeorm";
import { GroupMessage } from "../../../domain/entities/GroupMessage";
import { GroupMessageRepository } from "../../../application/repositories/GroupMessageRepository";
import { GroupMessageEntity } from "./entities/GroupMessageEntity";

export class MySQLGroupMessageRepository implements GroupMessageRepository {
  private repo: Repository<GroupMessageEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(GroupMessageEntity);
  }

  async save(message: GroupMessage): Promise<void> {
    const entity = this.toEntity(message);
    await this.repo.save(entity);
  }

  async findAll(): Promise<GroupMessage[]> {
    const entities = await this.repo.find({
      order: { createdAt: "ASC" }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<GroupMessage | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findRecent(limit: number = 100): Promise<GroupMessage[]> {
    const entities = await this.repo.find({
      order: { createdAt: "DESC" },
      take: limit
    });
    // Inverser pour avoir les plus anciens en premier
    return entities.reverse().map(e => this.toDomain(e));
  }

  private toEntity(message: GroupMessage): GroupMessageEntity {
    const entity = new GroupMessageEntity();
    entity.id = message.id;
    entity.senderId = message.senderId;
    entity.senderRole = message.senderRole;
    entity.senderName = message.senderName;
    entity.content = message.content;
    entity.createdAt = message.createdAt;
    return entity;
  }

  private toDomain(entity: GroupMessageEntity): GroupMessage {
    return new GroupMessage(
      entity.id,
      entity.senderId,
      entity.senderRole,
      entity.senderName,
      entity.content,
      entity.createdAt
    );
  }
}
