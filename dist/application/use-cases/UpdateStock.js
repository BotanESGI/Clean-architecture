"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStock = void 0;
class UpdateStock {
    constructor(stockRepository) {
        this.stockRepository = stockRepository;
    }
    async execute(stockId, data) {
        const stock = await this.stockRepository.findById(stockId);
        if (!stock) {
            throw new Error("Action introuvable");
        }
        if (data.symbol !== undefined) {
            // Vérifier que le nouveau symbole n'est pas déjà utilisé par une autre action
            const existing = await this.stockRepository.findBySymbol(data.symbol);
            if (existing && existing.id !== stockId) {
                throw new Error("Une action avec ce symbole existe déjà");
            }
            stock.setSymbol(data.symbol);
        }
        if (data.name !== undefined) {
            stock.setName(data.name);
        }
        if (data.isAvailable !== undefined) {
            stock.setIsAvailable(data.isAvailable);
        }
        await this.stockRepository.update(stock);
    }
}
exports.UpdateStock = UpdateStock;
