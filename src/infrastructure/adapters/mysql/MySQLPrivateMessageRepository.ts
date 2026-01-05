import { DataSource, Repository } from "typeorm";
import { PrivateMessage } from "../../../domain/entities/PrivateMessage";
import { PrivateMessageRepository } from "../../../application/repositories/PrivateMessageRepository";
import { PrivateMessageEntity } from "./entities/PrivateMessageEntity";

export class MySQLPrivateMessageRepository implements PrivateMessageRepository {
  private repo: Repository<PrivateMessageEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(PrivateMessageEntity);
  }

  async save(message: PrivateMessage): Promise<void> {
    const entity = this.toEntity(message);
    await this.repo.save(entity);
  }

  async findByConversation(clientId: string, advisorId: string): Promise<PrivateMessage[]> {
    const entities = await this.repo.find({
      where: [
        { senderId: clientId, receiverId: advisorId },
        { senderId: advisorId, receiverId: clientId }
      ],
      order: { createdAt: "ASC" }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<PrivateMessage | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.repo.update(messageId, { isRead: true });
  }

  async getUnreadCount(receiverId: string): Promise<number> {
    return await this.repo.count({
      where: { receiverId, isRead: false }
    });
  }

  async findAllByReceiver(receiverId: string): Promise<PrivateMessage[]> {
    // Récupérer tous les messages où le receiverId est soit le destinataire soit l'expéditeur
    // TypeORM nécessite un tableau de conditions pour OR
    const entities = await this.repo
      .createQueryBuilder("message")
      .where("message.receiverId = :receiverId", { receiverId })
      .orWhere("message.senderId = :receiverId", { receiverId })
      .orderBy("message.createdAt", "DESC")
      .getMany();
    return entities.map(e => this.toDomain(e));
  }

  private toEntity(message: PrivateMessage): PrivateMessageEntity {
    const entity = new PrivateMessageEntity();
    entity.id = message.id;
    entity.senderId = message.senderId;
    entity.receiverId = message.receiverId;
    entity.content = message.content;
    entity.isRead = message.isRead;
    entity.createdAt = message.createdAt;
    return entity;
  }

  private toDomain(entity: PrivateMessageEntity): PrivateMessage {
    return new PrivateMessage(
      entity.id,
      entity.senderId,
      entity.receiverId,
      entity.content,
      entity.createdAt,
      entity.isRead
    );
  }
}

