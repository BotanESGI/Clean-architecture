import { CreditRepository } from "../repositories/CreditRepository";
import { AccountRepository } from "../repositories/AccountRepository";
import { TransactionRepository } from "../repositories/TransactionRepository";
import { Transaction } from "../../domain/entities/Transaction";
import crypto from "crypto";

export class RecordCreditPayment {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(creditId: string): Promise<{
    interestAmount: number;
    capitalAmount: number;
    insuranceAmount: number;
    newRemainingCapital: number;
  }> {
    const credit = await this.creditRepository.findById(creditId);
    if (!credit) {
      throw new Error("Crédit introuvable");
    }

    if (credit.status !== "active") {
      throw new Error("Seuls les crédits actifs peuvent avoir des paiements");
    }

    // Récupérer le compte
    const account = await this.accountRepository.findById(credit.accountId);
    if (!account) {
      throw new Error("Compte introuvable");
    }

    // Vérifier que le compte a suffisamment de fonds pour la mensualité
    const totalMonthlyPayment = credit.monthlyPayment + credit.insuranceMonthlyAmount;
    if (account.balance < totalMonthlyPayment) {
      throw new Error("Solde insuffisant pour effectuer le paiement");
    }

    // Enregistrer le paiement
    const paymentDetails = credit.recordMonthlyPayment();

    // Débiter le compte
    account.debit(totalMonthlyPayment);

    // Créer une transaction pour le paiement
    const transaction = new Transaction(
      crypto.randomUUID(),
      credit.accountId,
      "transfer_out",
      totalMonthlyPayment,
      `Paiement crédit - Capital: ${paymentDetails.capitalAmount.toFixed(2)}€, Intérêts: ${paymentDetails.interestAmount.toFixed(2)}€, Assurance: ${paymentDetails.insuranceAmount.toFixed(2)}€`,
      undefined,
      undefined,
      new Date()
    );

    await this.transactionRepository.create(transaction);
    await this.accountRepository.update(account);
    await this.creditRepository.update(credit);

    return paymentDetails;
  }
}

