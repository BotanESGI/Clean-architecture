"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentController = void 0;
const Order_1 = require("../../domain/entities/Order");
const OrderEntity_1 = require("../../infrastructure/adapters/mysql/entities/OrderEntity");
const Transaction_1 = require("../../domain/entities/Transaction");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class InvestmentController {
    constructor(dataSource, stockRepository, accountRepository, transactionRepository, listAllStocks) {
        this.dataSource = dataSource;
        this.stockRepository = stockRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.listAllStocks = listAllStocks;
        // GET /stocks (public - liste des actions disponibles)
        this.listStocks = async (_req, res) => {
            try {
                const stocks = await this.listAllStocks.execute();
                const available = stocks.filter(s => s.isAvailable);
                // Formater la réponse pour le frontend
                res.status(200).json({
                    stocks: available.map(s => ({
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
                console.error("Error in listStocks:", err);
                res.status(400).json({ message: err.message });
            }
        };
        // POST /invest/orders (client authentifié)
        this.place = async (req, res) => {
            try {
                const token = req.headers.authorization?.replace("Bearer ", "");
                if (!token) {
                    return res.status(401).json({ message: "Token manquant" });
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const clientId = decoded.clientId;
                const { stockId, type, quantity, accountId } = req.body;
                if (!stockId || !type || !quantity || !accountId) {
                    return res.status(400).json({ message: "Données manquantes" });
                }
                const qty = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
                if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
                    return res.status(400).json({ message: "La quantité doit être un nombre entier supérieur à 0" });
                }
                // Vérifier que le stock existe et est disponible
                const stock = await this.stockRepository.findById(stockId);
                if (!stock) {
                    return res.status(404).json({ message: "Action introuvable" });
                }
                if (!stock.isAvailable) {
                    return res.status(400).json({ message: "Cette action n'est plus disponible" });
                }
                // Vérifier que le compte existe
                const account = await this.accountRepository.findById(accountId);
                if (!account) {
                    return res.status(404).json({ message: "Compte introuvable" });
                }
                if (account.clientId !== clientId) {
                    return res.status(403).json({ message: "Ce compte ne vous appartient pas" });
                }
                if (account.isClosed) {
                    return res.status(400).json({ message: "Ce compte est fermé" });
                }
                const price = stock.currentPrice;
                const fee = 1; // Frais fixes de 1€
                const totalAmount = qty * price + fee;
                // Pour un achat, vérifier le solde
                if (type === "BUY") {
                    if (account.balance < totalAmount) {
                        return res.status(400).json({ message: "Solde insuffisant" });
                    }
                    // Débiter le compte
                    account.debit(totalAmount);
                    await this.accountRepository.update(account);
                    // Créer transaction de débit
                    const transaction = new Transaction_1.Transaction(crypto_1.default.randomUUID(), account.id, "transfer_out", totalAmount, `Achat ${qty} ${stock.symbol} @ ${price.toFixed(2)}€ + frais ${fee}€`, undefined, undefined);
                    await this.transactionRepository.create(transaction);
                }
                else {
                    // Pour une vente, créditer le compte
                    account.credit(totalAmount);
                    await this.accountRepository.update(account);
                    // Créer transaction de crédit
                    const transaction = new Transaction_1.Transaction(crypto_1.default.randomUUID(), account.id, "transfer_in", totalAmount, `Vente ${qty} ${stock.symbol} @ ${price.toFixed(2)}€ - frais ${fee}€`, undefined, undefined);
                    await this.transactionRepository.create(transaction);
                }
                // Créer l'ordre et l'exécuter immédiatement
                const order = new Order_1.Order(crypto_1.default.randomUUID(), clientId, stockId, type, qty, price, fee);
                order.execute();
                // Sauvegarder dans la DB
                const orderRepo = this.dataSource.getRepository(OrderEntity_1.OrderEntity);
                const entity = new OrderEntity_1.OrderEntity();
                entity.id = order.id;
                entity.clientId = order.clientId;
                entity.stockId = order.stockId;
                entity.type = order.type;
                entity.quantity = order.quantity;
                entity.price = order.price;
                entity.fee = order.fee;
                entity.status = order.status;
                entity.createdAt = order.createdAt;
                await orderRepo.save(entity);
                res.status(201).json({ message: "Ordre exécuté", order });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
        // GET /invest/orders (client authentifié)
        this.listClientOrders = async (req, res) => {
            try {
                const token = req.headers.authorization?.replace("Bearer ", "");
                if (!token) {
                    return res.status(401).json({ message: "Token manquant" });
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const clientId = decoded.clientId;
                // Récupérer les ordres directement depuis la DB
                const orderRepo = this.dataSource.getRepository(OrderEntity_1.OrderEntity);
                const entities = await orderRepo.find({
                    where: { clientId },
                    order: { createdAt: "DESC" },
                });
                const orders = entities.map(e => ({
                    id: e.id,
                    clientId: e.clientId,
                    stockId: e.stockId,
                    type: e.type,
                    quantity: e.quantity,
                    price: Number(e.price),
                    fee: Number(e.fee),
                    status: e.status,
                    createdAt: e.createdAt,
                }));
                res.status(200).json({ orders });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
    }
}
exports.InvestmentController = InvestmentController;
