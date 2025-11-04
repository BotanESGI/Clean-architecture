export type TransactionType = "transfer_in" | "transfer_out";

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly label: string,
    public readonly relatedAccountId?: string, // Pour les virements : ID du compte de l'autre partie
    public readonly relatedClientName?: string, // Nom du client de l'autre partie
    public readonly createdAt: Date = new Date()
  ) {}
}

