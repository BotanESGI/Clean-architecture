"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLClientRepository = void 0;
const Client_1 = require("../../../domain/entities/Client");
const ClientEntity_1 = require("./entities/ClientEntity");
class MySQLClientRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repo = dataSource.getRepository(ClientEntity_1.ClientEntity);
    }
    async save(client) {
        const entity = this.toEntity(client);
        await this.repo.save(entity);
    }
    async update(client) {
        const entity = this.toEntity(client);
        await this.repo.save(entity);
    }
    async findById(id) {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByEmail(email) {
        const entity = await this.repo.findOne({ where: { email } });
        return entity ? this.toDomain(entity) : null;
    }
    toEntity(client) {
        const entity = new ClientEntity_1.ClientEntity();
        entity.id = client.getId();
        entity.firstName = client.getFirstName();
        entity.lastName = client.getLastName();
        entity.email = client.getEmail();
        entity.passwordHashed = client.getPasswordHash();
        entity.isVerified = client.getIsVerified();
        entity.accountIds = client.getAccountIds().length > 0 ? client.getAccountIds() : undefined;
        return entity;
    }
    toDomain(entity) {
        const client = new Client_1.Client(entity.id, entity.firstName, entity.lastName, entity.email, entity.passwordHashed, entity.isVerified, entity.accountIds || []);
        return client;
    }
}
exports.MySQLClientRepository = MySQLClientRepository;
