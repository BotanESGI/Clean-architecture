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
exports.CreditEntity = void 0;
const typeorm_1 = require("typeorm");
let CreditEntity = class CreditEntity {
};
exports.CreditEntity = CreditEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], CreditEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "client_id" }),
    __metadata("design:type", String)
], CreditEntity.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "advisor_id" }),
    __metadata("design:type", String)
], CreditEntity.prototype, "advisorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "account_id" }),
    __metadata("design:type", String)
], CreditEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CreditEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "annual_interest_rate", type: "decimal", precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], CreditEntity.prototype, "annualInterestRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "insurance_rate", type: "decimal", precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], CreditEntity.prototype, "insuranceRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "duration_months" }),
    __metadata("design:type", Number)
], CreditEntity.prototype, "durationMonths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "monthly_payment", type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CreditEntity.prototype, "monthlyPayment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "remaining_capital", type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CreditEntity.prototype, "remainingCapital", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["pending", "active", "completed", "cancelled"],
        default: "pending",
    }),
    __metadata("design:type", String)
], CreditEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "start_date", type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], CreditEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "next_payment_date", type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], CreditEntity.prototype, "nextPaymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "paid_months", default: 0 }),
    __metadata("design:type", Number)
], CreditEntity.prototype, "paidMonths", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], CreditEntity.prototype, "createdAt", void 0);
exports.CreditEntity = CreditEntity = __decorate([
    (0, typeorm_1.Entity)("credits")
], CreditEntity);
