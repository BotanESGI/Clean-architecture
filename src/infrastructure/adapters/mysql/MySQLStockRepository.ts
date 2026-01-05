import { DataSource, Repository } from "typeorm";
import { StockRepository } from "../../../application/repositories/StockRepository";
import { Stock } from "../../../domain/entities/Stock";
import { StockEntity } from "./entities/StockEntity";

export class MySQLStockRepository implements StockRepository {
  private repo: Repository<StockEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(StockEntity);
  }

  async save(stock: Stock): Promise<void> {
    const entity = this.toEntity(stock);
    await this.repo.save(entity);
  }

  async update(stock: Stock): Promise<void> {
    const entity = this.toEntity(stock);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Stock | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySymbol(symbol: string): Promise<Stock | null> {
    const entity = await this.repo.findOne({ where: { symbol: symbol.toUpperCase() } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Stock[]> {
    const entities = await this.repo.find({ order: { symbol: "ASC" } });
    return entities.map(e => this.toDomain(e));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toEntity(stock: Stock): StockEntity {
    const entity = new StockEntity();
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

  private toDomain(entity: StockEntity): Stock {
    const stock = new Stock(
      entity.id,
      entity.symbol,
      entity.name,
      Number(entity.currentPrice),
      entity.isAvailable,
      entity.createdAt
    );
    return stock;
  }
}

