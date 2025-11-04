import { DataSource, Repository } from "typeorm";
import { TransactionRepository } from "../../../application/repositories/TransactionRepository";
import { Transaction } from "../../../domain/entities/Transaction";
import { TransactionEntity } from "./entities/TransactionEntity";

export class MySQLTransactionRepository implements TransactionRepository {
  private repo: Repository<TransactionEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(TransactionEntity);
  }

  async create(transaction: Transaction): Promise<void> {
    const entity = this.toEntity(transaction);
    await this.repo.save(entity);
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const entities = await this.repo.find({
      where: { accountId },
      order: { createdAt: "DESC" }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findByAccountIds(accountIds: string[]): Promise<Transaction[]> {
    if (accountIds.length === 0) return [];
    const entities = await this.repo.find({
      where: accountIds.map(id => ({ accountId: id })),
      order: { createdAt: "DESC" }
    });
    return entities.map(e => this.toDomain(e));
  }

  private toEntity(transaction: Transaction): TransactionEntity {
    const entity = new TransactionEntity();
    entity.id = transaction.id;
    entity.accountId = transaction.accountId;
    entity.type = transaction.type;
    entity.amount = transaction.amount;
    entity.label = transaction.label;
    entity.relatedAccountId = transaction.relatedAccountId;
    entity.relatedClientName = transaction.relatedClientName;
    entity.createdAt = transaction.createdAt;
    return entity;
  }

  private toDomain(entity: TransactionEntity): Transaction {
    return new Transaction(
      entity.id,
      entity.accountId,
      entity.type as "transfer_in" | "transfer_out",
      Number(entity.amount),
      entity.label,
      entity.relatedAccountId,
      entity.relatedClientName,
      entity.createdAt
    );
  }
}

