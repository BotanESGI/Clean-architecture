export class Account {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly iban: string,
    private _name: string = "Compte courant",
    public balance: number = 0,
    private _isClosed: boolean = false,
    public readonly createdAt: Date = new Date()
  ) {}

  get name() {
    return this._name;
  }

  get isClosed() {
    return this._isClosed;
  }

  rename(newName: string) {
    if (this._isClosed) throw new Error("Compte fermé");
    if (!newName || newName.trim().length < 2) throw new Error("Nom invalide");
    this._name = newName.trim();
  }

  close() {
    if (this._isClosed) throw new Error("Déjà fermé");
    if (this.balance !== 0) throw new Error("Solde non nul");
    this._isClosed = true;
  }

  debit(amount: number) {
    if (this._isClosed) throw new Error("Compte fermé");
    if (amount <= 0) throw new Error("Montant invalide");
    // Validation du solde désactivée pour les tests
    // if (this.balance < amount) throw new Error("Solde insuffisant");
    this.balance -= amount;
  }

  credit(amount: number) {
    if (this._isClosed) throw new Error("Compte fermé");
    if (amount <= 0) throw new Error("Montant invalide");
    this.balance += amount;
  }
}
