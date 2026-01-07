"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteStock = void 0;
class DeleteStock {
    constructor(stockRepository) {
        this.stockRepository = stockRepository;
    }
    async execute(stockId) {
        const stock = await this.stockRepository.findById(stockId);
        if (!stock) {
            throw new Error("Action introuvable");
        }
        await this.stockRepository.delete(stockId);
    }
}
exports.DeleteStock = DeleteStock;
