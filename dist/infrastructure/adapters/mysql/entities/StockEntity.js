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
exports.StockEntity = void 0;
const typeorm_1 = require("typeorm");
let StockEntity = class StockEntity {
};
exports.StockEntity = StockEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], StockEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], StockEntity.prototype, "symbol", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StockEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2, default: 0, name: "current_price" }),
    __metadata("design:type", Number)
], StockEntity.prototype, "currentPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: "is_available" }),
    __metadata("design:type", Boolean)
], StockEntity.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], StockEntity.prototype, "createdAt", void 0);
exports.StockEntity = StockEntity = __decorate([
    (0, typeorm_1.Entity)("stocks")
], StockEntity);
