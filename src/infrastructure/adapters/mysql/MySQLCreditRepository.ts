import { DataSource, Repository } from "typeorm";
import { CreditRepository } from "../../../application/repositories/CreditRepository";
import { Credit } from "../../../domain/entities/Credit";
import { CreditEntity } from "./entities/CreditEntity";

export class MySQLCreditRepository implements CreditRepository {
  private repo: Repository<CreditEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(CreditEntity);
  }

  async create(credit: Credit): Promise<void> {
    const entity = this.toEntity(credit);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Credit | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByClientId(clientId: string): Promise<Credit[]> {
    const entities = await this.repo.find({ where: { clientId } });
    return entities.map(e => this.toDomain(e));
  }

  async findByAdvisorId(advisorId: string): Promise<Credit[]> {
    const entities = await this.repo.find({ where: { advisorId } });
    return entities.map(e => this.toDomain(e));
  }

  async update(credit: Credit): Promise<void> {
    const entity = this.toEntity(credit);
    await this.repo.save(entity);
  }

  async listAll(): Promise<Credit[]> {
    const entities = await this.repo.find();
    return entities.map(e => this.toDomain(e));
  }

  private toEntity(credit: Credit): CreditEntity {
    const entity = new CreditEntity();
    entity.id = credit.id;
    entity.clientId = credit.clientId;
    entity.advisorId = credit.advisorId;
    entity.accountId = credit.accountId;
    entity.amount = credit.amount;
    entity.annualInterestRate = credit.annualInterestRate;
    entity.insuranceRate = credit.insuranceRate;
    entity.durationMonths = credit.durationMonths;
    entity.monthlyPayment = credit.monthlyPayment;
    entity.remainingCapital = credit.remainingCapital;
    entity.status = credit.status;
    entity.startDate = credit.startDate;
    entity.nextPaymentDate = credit.nextPaymentDate;
    entity.paidMonths = credit.paidMonths;
    entity.createdAt = credit.createdAt;
    return entity;
  }

  private toDomain(entity: CreditEntity): Credit {
    const credit = new Credit(
      entity.id,
      entity.clientId,
      entity.advisorId,
      entity.accountId,
      Number(entity.amount),
      Number(entity.annualInterestRate),
      Number(entity.insuranceRate),
      entity.durationMonths,
      Number(entity.monthlyPayment),
      Number(entity.remainingCapital),
      entity.status as "pending" | "active" | "completed" | "cancelled",
      entity.createdAt,
      entity.startDate,
      entity.nextPaymentDate,
      entity.paidMonths
    );
    return credit;
  }
}

