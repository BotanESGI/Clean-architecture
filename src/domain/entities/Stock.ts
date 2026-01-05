export class Stock {
  constructor(
    public readonly id: string,
    private _symbol: string,
    private _name: string,
    private _currentPrice: number = 0,
    private _isAvailable: boolean = true,
    public readonly createdAt: Date = new Date()
  ) {}

  get symbol(): string {
    return this._symbol;
  }

  get name(): string {
    return this._name;
  }

  get currentPrice(): number {
    return this._currentPrice;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  setSymbol(symbol: string): void {
    if (!symbol || symbol.trim().length < 1) {
      throw new Error("Le symbole ne peut pas être vide");
    }
    this._symbol = symbol.trim().toUpperCase();
  }

  setName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error("Le nom doit contenir au moins 2 caractères");
    }
    this._name = name.trim();
  }

  setCurrentPrice(price: number): void {
    if (price < 0) {
      throw new Error("Le prix ne peut pas être négatif");
    }
    this._currentPrice = price;
  }

  setIsAvailable(available: boolean): void {
    this._isAvailable = available;
  }
}

