import crypto from "crypto";
import { StockRepository } from "../repositories/StockRepository";
import { Stock } from "../../domain/entities/Stock";

export class CreateStock {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(symbol: string, name: string, initialPrice: number = 0): Promise<Stock> {
    // Vérifier que le symbole n'existe pas déjà
    const existing = await this.stockRepository.findBySymbol(symbol);
    if (existing) {
      throw new Error("Une action avec ce symbole existe déjà");
    }

    if (initialPrice < 0) {
      throw new Error("Le prix initial ne peut pas être négatif");
    }

    const stock = new Stock(
      crypto.randomUUID(),
      symbol.toUpperCase(),
      name,
      initialPrice,
      true
    );

    await this.stockRepository.save(stock);
    
    // Récupérer le stock sauvegardé pour avoir le createdAt de la base
    const savedStock = await this.stockRepository.findById(stock.id);
    if (!savedStock) {
      throw new Error("Erreur lors de la création de l'action");
    }
    return savedStock;
  }
}

