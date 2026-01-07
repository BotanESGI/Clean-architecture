"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLPrivateMessageRepository = void 0;
const PrivateMessage_1 = require("../../../domain/entities/PrivateMessage");
const PrivateMessageEntity_1 = require("./entities/PrivateMessageEntity");
class MySQLPrivateMessageRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repo = this.dataSource.getRepository(PrivateMessageEntity_1.PrivateMessageEntity);
    }
    async save(message) {
        const entity = this.toEntity(message);
        await this.repo.save(entity);
    }
    async findByConversation(clientId, advisorId) {
        const entities = await this.repo.find({
            where: [
                { senderId: clientId, receiverId: advisorId },
                { senderId: advisorId, receiverId: clientId }
            ],
            order: { createdAt: "ASC" }
        });
        return entities.map(e => this.toDomain(e));
    }
    async findById(id) {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }
    async markAsRead(messageId) {
        await this.repo.update(messageId, { isRead: true });
    }
    async getUnreadCount(receiverId) {
        return await this.repo.count({
            where: { receiverId, isRead: false }
        });
    }
    async findAllByReceiver(receiverId) {
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
    toEntity(message) {
        const entity = new PrivateMessageEntity_1.PrivateMessageEntity();
        entity.id = message.id;
        entity.senderId = message.senderId;
        entity.receiverId = message.receiverId;
        entity.content = message.content;
        entity.isRead = message.isRead;
        entity.createdAt = message.createdAt;
        return entity;
    }
    toDomain(entity) {
        return new PrivateMessage_1.PrivateMessage(entity.id, entity.senderId, entity.receiverId, entity.content, entity.createdAt, entity.isRead);
    }
}
exports.MySQLPrivateMessageRepository = MySQLPrivateMessageRepository;
