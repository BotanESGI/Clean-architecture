"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectorController = void 0;
class DirectorController {
    constructor(listAllClients, banClient, unbanClient, updateClientInfo, deleteClient, createClientByDirector, setSavingsRate, bankSettingsRepo, createStockUseCase, updateStockUseCase, deleteStockUseCase, listAllStocks) {
        this.listAllClients = listAllClients;
        this.banClient = banClient;
        this.unbanClient = unbanClient;
        this.updateClientInfo = updateClientInfo;
        this.deleteClient = deleteClient;
        this.createClientByDirector = createClientByDirector;
        this.setSavingsRate = setSavingsRate;
        this.bankSettingsRepo = bankSettingsRepo;
        this.createStockUseCase = createStockUseCase;
        this.updateStockUseCase = updateStockUseCase;
        this.deleteStockUseCase = deleteStockUseCase;
        this.listAllStocks = listAllStocks;
        this.createClient = async (req, res) => {
            try {
                const { firstName, lastName, email, password } = req.body;
                const result = await this.createClientByDirector.execute(firstName, lastName, email, password);
                res.status(201).json({
                    message: "Client créé avec succès",
                    client: result.client,
                    account: result.account
                });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.listClients = async (_req, res) => {
            try {
                const clients = await this.listAllClients.execute();
                res.status(200).json({ clients });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.ban = async (req, res) => {
            try {
                const { id } = req.params;
                await this.banClient.execute(id);
                res.status(200).json({ message: "Client banni avec succès" });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.unban = async (req, res) => {
            try {
                const { id } = req.params;
                await this.unbanClient.execute(id);
                res.status(200).json({ message: "Client débanni avec succès" });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.update = async (req, res) => {
            try {
                const { id } = req.params;
                const { firstName, lastName, email } = req.body;
                await this.updateClientInfo.execute(id, { firstName, lastName, email });
                res.status(200).json({ message: "Client modifié avec succès" });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.remove = async (req, res) => {
            try {
                const { id } = req.params;
                await this.deleteClient.execute(id);
                res.status(200).json({ message: "Client supprimé avec succès" });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.getSavingsRate = async (_req, res) => {
            try {
                const rate = await this.bankSettingsRepo.getSavingsRate();
                res.status(200).json({
                    rate: rate * 100 // Retourner en pourcentage
                });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.updateSavingsRate = async (req, res) => {
            try {
                const { rate } = req.body;
                if (rate === undefined || rate === null) {
                    return res.status(400).json({ message: "Le taux est requis" });
                }
                // Convertir le pourcentage en décimal si nécessaire (ex: 1.5 pour 1.5%)
                const rateDecimal = rate > 1 ? rate / 100 : rate;
                await this.setSavingsRate.execute(rateDecimal);
                res.status(200).json({
                    message: "Taux d'épargne mis à jour avec succès",
                    rate: rateDecimal * 100 // Retourner en pourcentage
                });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        // === Gestion des Actions ===
        this.createStock = async (req, res) => {
            try {
                const { symbol, name, initialPrice } = req.body;
                if (!symbol || !name) {
                    return res.status(400).json({ message: "Le symbole et le nom sont requis" });
                }
                const stock = await this.createStockUseCase.execute(symbol, name, initialPrice || 0);
                res.status(201).json({
                    message: "Action créée avec succès",
                    stock: {
                        id: stock.id,
                        symbol: stock.symbol,
                        name: stock.name,
                        currentPrice: stock.currentPrice,
                        isAvailable: stock.isAvailable,
                        createdAt: stock.createdAt
                    }
                });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.listStocks = async (_req, res) => {
            try {
                const stocks = await this.listAllStocks.execute();
                res.status(200).json({
                    stocks: stocks.map(s => ({
                        id: s.id,
                        symbol: s.symbol,
                        name: s.name,
                        currentPrice: s.currentPrice,
                        isAvailable: s.isAvailable,
                        createdAt: s.createdAt
                    }))
                });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.updateStock = async (req, res) => {
            try {
                const { id } = req.params;
                const { symbol, name, isAvailable } = req.body;
                await this.updateStockUseCase.execute(id, { symbol, name, isAvailable });
                res.status(200).json({ message: "Action modifiée avec succès" });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        this.removeStock = async (req, res) => {
            try {
                const { id } = req.params;
                await this.deleteStockUseCase.execute(id);
                res.status(200).json({ message: "Action supprimée avec succès" });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
    }
}
exports.DirectorController = DirectorController;
