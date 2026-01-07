"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stock = void 0;
class Stock {
    constructor(id, _symbol, _name, _currentPrice = 0, _isAvailable = true, createdAt = new Date()) {
        this.id = id;
        this._symbol = _symbol;
        this._name = _name;
        this._currentPrice = _currentPrice;
        this._isAvailable = _isAvailable;
        this.createdAt = createdAt;
    }
    get symbol() {
        return this._symbol;
    }
    get name() {
        return this._name;
    }
    get currentPrice() {
        return this._currentPrice;
    }
    get isAvailable() {
        return this._isAvailable;
    }
    setSymbol(symbol) {
        if (!symbol || symbol.trim().length < 1) {
            throw new Error("Le symbole ne peut pas être vide");
        }
        this._symbol = symbol.trim().toUpperCase();
    }
    setName(name) {
        if (!name || name.trim().length < 2) {
            throw new Error("Le nom doit contenir au moins 2 caractères");
        }
        this._name = name.trim();
    }
    setCurrentPrice(price) {
        if (price < 0) {
            throw new Error("Le prix ne peut pas être négatif");
        }
        this._currentPrice = price;
    }
    setIsAvailable(available) {
        this._isAvailable = available;
    }
}
exports.Stock = Stock;
