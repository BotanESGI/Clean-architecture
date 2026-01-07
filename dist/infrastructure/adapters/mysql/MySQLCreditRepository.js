"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLCreditRepository = void 0;
const Credit_1 = require("../../../domain/entities/Credit");
const CreditEntity_1 = require("./entities/CreditEntity");
class MySQLCreditRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repo = dataSource.getRepository(CreditEntity_1.CreditEntity);
    }
    async create(credit) {
        const entity = this.toEntity(credit);
        await this.repo.save(entity);
    }
    async findById(id) {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByClientId(clientId) {
        const entities = await this.repo.find({ where: { clientId } });
        return entities.map(e => this.toDomain(e));
    }
    async findByAdvisorId(advisorId) {
        const entities = await this.repo.find({ where: { advisorId } });
        return entities.map(e => this.toDomain(e));
    }
    async update(credit) {
        const entity = this.toEntity(credit);
        await this.repo.save(entity);
    }
    async listAll() {
        const entities = await this.repo.find();
        return entities.map(e => this.toDomain(e));
    }
    toEntity(credit) {
        const entity = new CreditEntity_1.CreditEntity();
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
    toDomain(entity) {
        const credit = new Credit_1.Credit(entity.id, entity.clientId, entity.advisorId, entity.accountId, Number(entity.amount), Number(entity.annualInterestRate), Number(entity.insuranceRate), entity.durationMonths, Number(entity.monthlyPayment), Number(entity.remainingCapital), entity.status, entity.createdAt, entity.startDate, entity.nextPaymentDate, entity.paidMonths);
        return credit;
    }
}
exports.MySQLCreditRepository = MySQLCreditRepository;
