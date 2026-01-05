import { StockRepository } from "../repositories/StockRepository";
import { Stock } from "../../domain/entities/Stock";

export class ListAllStocks {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(): Promise<Stock[]> {
    return await this.stockRepository.findAll();
  }
}

