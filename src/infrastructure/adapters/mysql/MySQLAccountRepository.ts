import { DataSource, Repository } from "typeorm";
import { AccountRepository } from "../../../application/repositories/AccountRepository";
import { Account } from "../../../domain/entities/Account";
import { AccountEntity } from "./entities/AccountEntity";

export class MySQLAccountRepository implements AccountRepository {
  private repo: Repository<AccountEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(AccountEntity);
  }

  async create(account: Account): Promise<void> {
    const entity = this.toEntity(account);
    await this.repo.save(entity);
  }

  async findByIban(iban: string): Promise<Account | null> {
    const entity = await this.repo.findOne({ where: { iban } });
    return entity ? this.toDomain(entity) : null;
  }

  async update(account: Account): Promise<void> {
    const entity = this.toEntity(account);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Account | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Account[]> {
    const entities = await this.repo.find({ where: { clientId: ownerId } });
    return entities.map(e => this.toDomain(e));
  }

  async delete(iban: string): Promise<void> {
    await this.repo.delete({ iban });
  }

  async listAll(): Promise<Account[]> {
    const entities = await this.repo.find();
    return entities.map(e => this.toDomain(e));
  }

  private toEntity(account: Account): AccountEntity {
    const entity = new AccountEntity();
    entity.id = account.id;
    entity.clientId = account.clientId;
    entity.iban = account.iban;
    entity.name = account.name;
    entity.balance = account.balance;
    entity.isClosed = account.isClosed;
    entity.createdAt = account.createdAt;
    return entity;
  }

  private toDomain(entity: AccountEntity): Account {
    const account = new Account(
      entity.id,
      entity.clientId,
      entity.iban,
      entity.name,
      Number(entity.balance),
      entity.isClosed,
      entity.createdAt
    );
    return account;
  }
}

