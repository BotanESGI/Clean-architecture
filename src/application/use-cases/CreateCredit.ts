import crypto from "crypto";
import { CreditRepository } from "../repositories/CreditRepository";
import { AccountRepository } from "../repositories/AccountRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { Credit } from "../../domain/entities/Credit";

export class CreateCredit {
  constructor(
    private readonly creditRepository: CreditRepository,
    private readonly accountRepository: AccountRepository,
    private readonly clientRepository: ClientRepository
  ) {}

  async execute(params: {
    clientId: string;
    advisorId: string;
    accountId: string;
    amount: number;
    annualInterestRate: number;
    insuranceRate: number;
    durationMonths: number;
  }): Promise<Credit> {
    // Validation des paramètres
    if (params.amount <= 0) {
      throw new Error("Le montant du crédit doit être positif");
    }
    if (params.annualInterestRate < 0) {
      throw new Error("Le taux d'intérêt ne peut pas être négatif");
    }
    if (params.insuranceRate < 0) {
      throw new Error("Le taux d'assurance ne peut pas être négatif");
    }
    if (params.durationMonths <= 0 || params.durationMonths > 600) {
      throw new Error("La durée doit être entre 1 et 600 mois");
    }

    // Vérifier que le client existe
    const client = await this.clientRepository.findById(params.clientId);
    if (!client) {
      throw new Error("Client introuvable");
    }

    // Vérifier que le compte existe et appartient au client
    const account = await this.accountRepository.findById(params.accountId);
    if (!account) {
      throw new Error("Compte introuvable");
    }
    if (account.clientId !== params.clientId) {
      throw new Error("Le compte n'appartient pas au client");
    }

    // Calculer la mensualité constante
    const monthlyPayment = Credit.calculateMonthlyPayment(
      params.amount,
      params.annualInterestRate,
      params.durationMonths
    );

    // Créer le crédit
    const credit = new Credit(
      crypto.randomUUID(),
      params.clientId,
      params.advisorId,
      params.accountId,
      params.amount,
      params.annualInterestRate,
      params.insuranceRate,
      params.durationMonths,
      monthlyPayment,
      params.amount, // Capital restant = montant initial au début
      "pending"
    );

    await this.creditRepository.create(credit);
    return credit;
  }
}

