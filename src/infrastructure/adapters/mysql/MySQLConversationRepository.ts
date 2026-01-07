import { DataSource, Repository, IsNull } from "typeorm";
import { Conversation } from "../../../domain/entities/Conversation";
import { ConversationRepository } from "../../../application/repositories/ConversationRepository";
import { ConversationEntity } from "./entities/ConversationEntity";

export class MySQLConversationRepository implements ConversationRepository {
  private repo: Repository<ConversationEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(ConversationEntity);
  }

  async save(conversation: Conversation): Promise<void> {
    const existingEntity = await this.repo.findOne({ where: { id: conversation.id } });
    if (existingEntity) {
      existingEntity.clientId = conversation.clientId;
      existingEntity.assignedAdvisorId = conversation.assignedAdvisorId;
      await this.repo.save(existingEntity);
    } else {
      const entity = this.toEntity(conversation);
      await this.repo.save(entity);
    }
  }

  async findByClientId(clientId: string): Promise<Conversation | null> {
    const entity = await this.repo.findOne({
      where: { clientId }
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByAdvisorId(advisorId: string): Promise<Conversation[]> {
    const entities = await this.repo.find({
      where: { assignedAdvisorId: advisorId },
      order: { updatedAt: "DESC" }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findPendingConversations(): Promise<Conversation[]> {
    const entities = await this.repo.find({
      where: { assignedAdvisorId: IsNull() },
      order: { createdAt: "DESC" }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<Conversation | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  private toEntity(conversation: Conversation): ConversationEntity {
    const entity = new ConversationEntity();
    entity.id = conversation.id;
    entity.clientId = conversation.clientId;
    entity.assignedAdvisorId = conversation.assignedAdvisorId;
    entity.createdAt = conversation.createdAt;
    return entity;
  }

  private toDomain(entity: ConversationEntity): Conversation {
    return new Conversation(
      entity.id,
      entity.clientId,
      entity.assignedAdvisorId,
      entity.createdAt,
      entity.updatedAt
    );
  }
}

