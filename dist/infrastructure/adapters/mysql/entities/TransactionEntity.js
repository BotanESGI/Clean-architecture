"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionEntity = void 0;
const typeorm_1 = require("typeorm");
const AccountEntity_1 = require("./AccountEntity");
let TransactionEntity = class TransactionEntity {
};
exports.TransactionEntity = TransactionEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], TransactionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "accountId" }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => AccountEntity_1.AccountEntity, (account) => account.transactions),
    (0, typeorm_1.JoinColumn)({ name: "accountId" }),
    __metadata("design:type", AccountEntity_1.AccountEntity)
], TransactionEntity.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], TransactionEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransactionEntity.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "relatedAccountId", nullable: true }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "relatedAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "relatedClientName", nullable: true }),
    __metadata("design:type", String)
], TransactionEntity.prototype, "relatedClientName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "createdAt" }),
    __metadata("design:type", Date)
], TransactionEntity.prototype, "createdAt", void 0);
exports.TransactionEntity = TransactionEntity = __decorate([
    (0, typeorm_1.Entity)("transactions")
], TransactionEntity);
