import crypto from "crypto";
import { CreditRepository } from "../repositories/CreditRepository";
import { AccountRepository } from "../repositories/AccountRepository";
import { TransactionRepository } from "../repositories/TransactionRepository";
import { Transaction } from "../../domain/entities/Transaction";

export class ActivateCredit {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(creditId: string): Promise<void> {
    const credit = await this.creditRepository.findById(creditId);
    if (!credit) {
      throw new Error("Crédit introuvable");
    }

    if (credit.status !== "pending") {
      throw new Error("Seuls les crédits en attente peuvent être activés");
    }

    // Récupérer le compte
    const account = await this.accountRepository.findById(credit.accountId);
    if (!account) {
      throw new Error("Compte introuvable");
    }

    // Activer le crédit
    credit.activate();

    // Créditer le compte avec le montant du crédit
    account.credit(credit.amount);

    // Créer une transaction pour le versement du crédit
    const transaction = new Transaction(
      crypto.randomUUID(),
      credit.accountId,
      "transfer_in",
      credit.amount,
      `Crédit octroyé - ${credit.amount.toFixed(2)}€`,
      undefined,
      undefined,
      new Date()
    );

    await this.transactionRepository.create(transaction);
    await this.accountRepository.update(account);
    await this.creditRepository.update(credit);
  }
}

