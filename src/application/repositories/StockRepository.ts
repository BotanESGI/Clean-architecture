import { Stock } from "../../domain/entities/Stock";

export interface StockRepository {
  save(stock: Stock): Promise<void>;
  update(stock: Stock): Promise<void>;
  findById(id: string): Promise<Stock | null>;
  findBySymbol(symbol: string): Promise<Stock | null>;
  findAll(): Promise<Stock[]>;
  delete(id: string): Promise<void>;
}

