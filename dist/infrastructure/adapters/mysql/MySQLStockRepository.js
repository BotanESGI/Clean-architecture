"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLStockRepository = void 0;
const Stock_1 = require("../../../domain/entities/Stock");
const StockEntity_1 = require("./entities/StockEntity");
class MySQLStockRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repo = dataSource.getRepository(StockEntity_1.StockEntity);
    }
    async save(stock) {
        const entity = this.toEntity(stock);
        await this.repo.save(entity);
    }
    async update(stock) {
        const entity = this.toEntity(stock);
        await this.repo.save(entity);
    }
    async findById(id) {
        const entity = await this.repo.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }
    async findBySymbol(symbol) {
        const entity = await this.repo.findOne({ where: { symbol: symbol.toUpperCase() } });
        return entity ? this.toDomain(entity) : null;
    }
    async findAll() {
        const entities = await this.repo.find({ order: { symbol: "ASC" } });
        return entities.map(e => this.toDomain(e));
    }
    async delete(id) {
        await this.repo.delete(id);
    }
    toEntity(stock) {
        const entity = new StockEntity_1.StockEntity();
        entity.id = stock.id;
        entity.symbol = stock.symbol;
        entity.name = stock.name;
        entity.currentPrice = stock.currentPrice;
        entity.isAvailable = stock.isAvailable;
        // createdAt sera géré automatiquement par TypeORM avec @CreateDateColumn
        if (stock.createdAt) {
            entity.createdAt = stock.createdAt;
        }
        return entity;
    }
    toDomain(entity) {
        const stock = new Stock_1.Stock(entity.id, entity.symbol, entity.name, Number(entity.currentPrice), entity.isAvailable, entity.createdAt);
        return stock;
    }
}
exports.MySQLStockRepository = MySQLStockRepository;
