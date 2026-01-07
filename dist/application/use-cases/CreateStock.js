"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStock = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Stock_1 = require("../../domain/entities/Stock");
class CreateStock {
    constructor(stockRepository) {
        this.stockRepository = stockRepository;
    }
    async execute(symbol, name, initialPrice = 0) {
        // Vérifier que le symbole n'existe pas déjà
        const existing = await this.stockRepository.findBySymbol(symbol);
        if (existing) {
            throw new Error("Une action avec ce symbole existe déjà");
        }
        if (initialPrice < 0) {
            throw new Error("Le prix initial ne peut pas être négatif");
        }
        const stock = new Stock_1.Stock(crypto_1.default.randomUUID(), symbol.toUpperCase(), name, initialPrice, true);
        await this.stockRepository.save(stock);
        // Récupérer le stock sauvegardé pour avoir le createdAt de la base
        const savedStock = await this.stockRepository.findById(stock.id);
        if (!savedStock) {
            throw new Error("Erreur lors de la création de l'action");
        }
        return savedStock;
    }
}
exports.CreateStock = CreateStock;
