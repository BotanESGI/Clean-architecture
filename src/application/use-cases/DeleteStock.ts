import { StockRepository } from "../repositories/StockRepository";

export class DeleteStock {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(stockId: string): Promise<void> {
    const stock = await this.stockRepository.findById(stockId);
    if (!stock) {
      throw new Error("Action introuvable");
    }

    await this.stockRepository.delete(stockId);
  }
}

