"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
class Order {
    constructor(id, clientId, stockId, type, quantity, price, // Prix d'exécution
    fee = 1, // Frais fixes de 1€
    _status = "PENDING", createdAt = new Date()) {
        this.id = id;
        this.clientId = clientId;
        this.stockId = stockId;
        this.type = type;
        this.quantity = quantity;
        this.price = price;
        this.fee = fee;
        this._status = _status;
        this.createdAt = createdAt;
    }
    get status() {
        return this._status;
    }
    get totalAmount() {
        return this.quantity * this.price + this.fee;
    }
    execute() {
        if (this._status !== "PENDING") {
            throw new Error("Ordre déjà exécuté ou annulé");
        }
        this._status = "EXECUTED";
    }
    cancel() {
        if (this._status !== "PENDING") {
            throw new Error("Ordre déjà exécuté ou annulé");
        }
        this._status = "CANCELLED";
    }
}
exports.Order = Order;
