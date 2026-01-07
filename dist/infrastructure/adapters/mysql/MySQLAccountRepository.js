"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLAccountRepository = void 0;
const Account_1 = require("../../../domain/entities/Account");
const AccountEntity_1 = require("./entities/AccountEntity");
class MySQLAccountRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repo = dataSource.getRepository(AccountEntity_1.AccountEntity);
    }
    async create(account) {
        const entity = this.toEntity(account);
        await this.repo.save(entity);
    }
    async findByIban(iban) {
        const entity = await this.repo.findOne({ where: { iban } });
        return entity ? this.toDomain(entity) : null;
    }
    async update(account) {
        const entity = this.toEntity(account);
        await this.repo.save(entity);
    }
    async findById(id) {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByOwnerId(ownerId) {
        const entities = await this.repo.find({ where: { clientId: ownerId } });
        return entities.map(e => this.toDomain(e));
    }
    async delete(iban) {
        await this.repo.delete({ iban });
    }
    async listAll() {
        const entities = await this.repo.find();
        return entities.map(e => this.toDomain(e));
    }
    toEntity(account) {
        const entity = new AccountEntity_1.AccountEntity();
        entity.id = account.id;
        entity.clientId = account.clientId;
        entity.iban = account.iban;
        entity.name = account.name;
        entity.balance = account.balance;
        entity.isClosed = account.isClosed;
        entity.accountType = account.accountType;
        entity.createdAt = account.createdAt;
        return entity;
    }
    toDomain(entity) {
        const account = new Account_1.Account(entity.id, entity.clientId, entity.iban, entity.name, Number(entity.balance), entity.isClosed, entity.accountType || "checking", entity.createdAt);
        return account;
    }
}
exports.MySQLAccountRepository = MySQLAccountRepository;
