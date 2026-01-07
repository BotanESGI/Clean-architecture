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
    async findAll() {
        const entities = await this.repo.find();
        return entities.map(e => this.toDomain(e));
    }
    async delete(id) {
        await this.repo.delete(id);
    }
    toEntity(client) {
        const entity = new ClientEntity_1.ClientEntity();
        entity.id = client.getId();
        entity.firstName = client.getFirstName();
        entity.lastName = client.getLastName();
        entity.email = client.getEmail();
        entity.passwordHashed = client.getPasswordHash();
        entity.isVerified = client.getIsVerified();
        entity.role = client.getRole();
        entity.isBanned = client.getIsBanned();
        return entity;
    }
    toDomain(entity) {
        const client = new Client_1.Client(entity.id, entity.firstName, entity.lastName, entity.email, entity.passwordHashed, entity.isVerified, [], // accountIds n'est plus stocké en base, on peut le récupérer via la relation avec accounts
        entity.role || 'CLIENT', entity.isBanned || false);
        return client;
    }
}
exports.MySQLClientRepository = MySQLClientRepository;
