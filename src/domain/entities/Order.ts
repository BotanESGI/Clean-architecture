export type OrderType = "BUY" | "SELL";
export type OrderStatus = "PENDING" | "EXECUTED" | "CANCELLED";

export class Order {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly stockId: string,
    public readonly type: OrderType,
    public readonly quantity: number,
    public readonly price: number, // Prix d'exécution
    public readonly fee: number = 1, // Frais fixes de 1€
    private _status: OrderStatus = "PENDING",
    public readonly createdAt: Date = new Date()
  ) {}

  get status(): OrderStatus {
    return this._status;
  }

  get totalAmount(): number {
    return this.quantity * this.price + this.fee;
  }

  execute(): void {
    if (this._status !== "PENDING") {
      throw new Error("Ordre déjà exécuté ou annulé");
    }
    this._status = "EXECUTED";
  }

  cancel(): void {
    if (this._status !== "PENDING") {
      throw new Error("Ordre déjà exécuté ou annulé");
    }
    this._status = "CANCELLED";
  }
}

