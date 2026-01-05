import { Request, Response } from "express";
import { CreateCredit } from "../../application/use-cases/CreateCredit";
import { ActivateCredit } from "../../application/use-cases/ActivateCredit";
import { ListCredits } from "../../application/use-cases/ListCredits";
import { RecordCreditPayment } from "../../application/use-cases/RecordCreditPayment";
import { Credit } from "../../domain/entities/Credit";
import { ClientRepository } from "../../application/repositories/ClientRepository";

export class CreditController {
  constructor(
    private readonly createCredit: CreateCredit,
    private readonly activateCredit: ActivateCredit,
    private readonly listCredits: ListCredits,
    private readonly recordCreditPayment: RecordCreditPayment,
    private readonly clientRepository?: ClientRepository
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const advisorId = (req as any).user?.clientId;
      if (!advisorId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const { clientId, accountId, amount, annualInterestRate, insuranceRate, durationMonths } = req.body;

      console.log("Création crédit - Données reçues:", {
        advisorId,
        clientId,
        accountId,
        amount,
        annualInterestRate,
        insuranceRate,
        durationMonths,
      });

      if (!clientId || !accountId || !amount || annualInterestRate === undefined || insuranceRate === undefined || !durationMonths) {
        return res.status(400).json({ 
          message: "Paramètres manquants",
          received: { clientId, accountId, amount, annualInterestRate, insuranceRate, durationMonths }
        });
      }

      const credit = await this.createCredit.execute({
        clientId,
        advisorId,
        accountId,
        amount: parseFloat(amount),
        annualInterestRate: parseFloat(annualInterestRate),
        insuranceRate: parseFloat(insuranceRate),
        durationMonths: parseInt(durationMonths, 10),
      });

      res.status(201).json({
        id: credit.id,
        clientId: credit.clientId,
        advisorId: credit.advisorId,
        accountId: credit.accountId,
        amount: credit.amount,
        annualInterestRate: credit.annualInterestRate,
        insuranceRate: credit.insuranceRate,
        durationMonths: credit.durationMonths,
        monthlyPayment: credit.monthlyPayment,
        remainingCapital: credit.remainingCapital,
        status: credit.status,
        insuranceMonthlyAmount: credit.insuranceMonthlyAmount,
        totalInterestAmount: credit.getTotalInterestAmount(),
        totalInsuranceAmount: credit.getTotalInsuranceAmount(),
        totalCost: credit.getTotalCost(),
        createdAt: credit.createdAt,
      });
    } catch (error: unknown) {
      console.error("Erreur création crédit:", error);
      const message = error instanceof Error ? error.message : "Erreur lors de la création du crédit";
      res.status(400).json({ message });
    }
  };

  activate = async (req: Request, res: Response) => {
    try {
      const { creditId } = req.params;
      await this.activateCredit.execute(creditId);
      res.status(200).json({ message: "Crédit activé avec succès" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de l'activation du crédit";
      res.status(400).json({ message });
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const advisorId = (req as any).user?.clientId;
      const { clientId, status } = req.query;

      const credits = await this.listCredits.execute({
        advisorId: advisorId as string,
        clientId: clientId as string | undefined,
        status: status as "pending" | "active" | "completed" | "cancelled" | undefined,
      });

      res.status(200).json({
        credits: credits.map((credit) => ({
          id: credit.id,
          clientId: credit.clientId,
          advisorId: credit.advisorId,
          accountId: credit.accountId,
          amount: credit.amount,
          annualInterestRate: credit.annualInterestRate,
          insuranceRate: credit.insuranceRate,
          durationMonths: credit.durationMonths,
          monthlyPayment: credit.monthlyPayment,
          remainingCapital: credit.remainingCapital,
          status: credit.status,
          insuranceMonthlyAmount: credit.insuranceMonthlyAmount,
          paidMonths: credit.paidMonths,
          startDate: credit.startDate,
          nextPaymentDate: credit.nextPaymentDate,
          totalInterestAmount: credit.getTotalInterestAmount(),
          totalInsuranceAmount: credit.getTotalInsuranceAmount(),
          totalCost: credit.getTotalCost(),
          createdAt: credit.createdAt,
        })),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de la récupération des crédits";
      res.status(500).json({ message });
    }
  };

  recordPayment = async (req: Request, res: Response) => {
    try {
      const { creditId } = req.params;
      const paymentDetails = await this.recordCreditPayment.execute(creditId);
      res.status(200).json({
        message: "Paiement enregistré avec succès",
        paymentDetails,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de l'enregistrement du paiement";
      res.status(400).json({ message });
    }
  };

  calculatePreview = async (req: Request, res: Response) => {
    try {
      const { amount, annualInterestRate, durationMonths, insuranceRate } = req.body;

      if (!amount || annualInterestRate === undefined || !durationMonths || insuranceRate === undefined) {
        return res.status(400).json({ message: "Paramètres manquants" });
      }

      const monthlyPayment = Credit.calculateMonthlyPayment(
        parseFloat(amount),
        parseFloat(annualInterestRate),
        parseInt(durationMonths, 10)
      );

      const insuranceMonthlyAmount = (parseFloat(amount) * parseFloat(insuranceRate)) / 100 / 12;
      const totalMonthlyPayment = monthlyPayment + insuranceMonthlyAmount;
      const totalInterestAmount = (monthlyPayment * parseInt(durationMonths, 10)) - parseFloat(amount);
      const totalInsuranceAmount = insuranceMonthlyAmount * parseInt(durationMonths, 10);
      const totalCost = parseFloat(amount) + totalInterestAmount + totalInsuranceAmount;

      res.status(200).json({
        monthlyPayment,
        insuranceMonthlyAmount,
        totalMonthlyPayment,
        totalInterestAmount,
        totalInsuranceAmount,
        totalCost,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors du calcul";
      res.status(400).json({ message });
    }
  };

  listClients = async (_req: Request, res: Response) => {
    try {
      if (!this.clientRepository) {
        return res.status(500).json({ message: "Repository client non disponible" });
      }
      const allClients = await this.clientRepository.findAll();
      // Filtrer pour ne garder que les clients (pas les conseillers ni directeurs)
      const clients = allClients.filter(c => c.getRole() === "CLIENT");
      res.status(200).json({
        clients: clients.map(c => ({
          id: c.getId(),
          firstName: c.getFirstName(),
          lastName: c.getLastName(),
          email: c.getEmail(),
          isVerified: c.getIsVerified(),
          isBanned: c.getIsBanned(),
          role: c.getRole(),
        })),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de la récupération des clients";
      res.status(500).json({ message });
    }
  };
}

