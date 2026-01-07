"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditController = void 0;
const Credit_1 = require("../../domain/entities/Credit");
class CreditController {
    constructor(createCredit, activateCredit, listCredits, recordCreditPayment, clientRepository) {
        this.createCredit = createCredit;
        this.activateCredit = activateCredit;
        this.listCredits = listCredits;
        this.recordCreditPayment = recordCreditPayment;
        this.clientRepository = clientRepository;
        this.create = async (req, res) => {
            try {
                const advisorId = req.user?.clientId;
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
            }
            catch (error) {
                console.error("Erreur création crédit:", error);
                const message = error instanceof Error ? error.message : "Erreur lors de la création du crédit";
                res.status(400).json({ message });
            }
        };
        this.activate = async (req, res) => {
            try {
                const { creditId } = req.params;
                await this.activateCredit.execute(creditId);
                res.status(200).json({ message: "Crédit activé avec succès" });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Erreur lors de l'activation du crédit";
                res.status(400).json({ message });
            }
        };
        this.list = async (req, res) => {
            try {
                const advisorId = req.user?.clientId;
                const { clientId, status } = req.query;
                const credits = await this.listCredits.execute({
                    advisorId: advisorId,
                    clientId: clientId,
                    status: status,
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
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Erreur lors de la récupération des crédits";
                res.status(500).json({ message });
            }
        };
        this.recordPayment = async (req, res) => {
            try {
                const { creditId } = req.params;
                const paymentDetails = await this.recordCreditPayment.execute(creditId);
                res.status(200).json({
                    message: "Paiement enregistré avec succès",
                    paymentDetails,
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Erreur lors de l'enregistrement du paiement";
                res.status(400).json({ message });
            }
        };
        this.calculatePreview = async (req, res) => {
            try {
                const { amount, annualInterestRate, durationMonths, insuranceRate } = req.body;
                if (!amount || annualInterestRate === undefined || !durationMonths || insuranceRate === undefined) {
                    return res.status(400).json({ message: "Paramètres manquants" });
                }
                const monthlyPayment = Credit_1.Credit.calculateMonthlyPayment(parseFloat(amount), parseFloat(annualInterestRate), parseInt(durationMonths, 10));
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
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Erreur lors du calcul";
                res.status(400).json({ message });
            }
        };
        this.listClients = async (_req, res) => {
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
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Erreur lors de la récupération des clients";
                res.status(500).json({ message });
            }
        };
    }
}
exports.CreditController = CreditController;
