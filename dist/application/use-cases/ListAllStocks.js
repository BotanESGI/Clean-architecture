"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAllStocks = void 0;
class ListAllStocks {
    constructor(stockRepository) {
        this.stockRepository = stockRepository;
    }
    async execute() {
        return await this.stockRepository.findAll();
    }
}
exports.ListAllStocks = ListAllStocks;
