"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credit = void 0;
class Credit {
    constructor(id, clientId, // Client qui a reçu le crédit
    advisorId, // Conseiller qui a octroyé le crédit
    accountId, // Compte sur lequel le crédit est versé
    _amount, // Montant total du crédit
    _annualInterestRate, // Taux annuel d'intérêts (en pourcentage, ex: 3.5 pour 3.5%)
    _insuranceRate, // Taux d'assurance (en pourcentage, ex: 0.5 pour 0.5%)
    _durationMonths, // Durée en mois
    _monthlyPayment, // Mensualité constante calculée
    _remainingCapital, // Capital restant dû
    _status = "pending", createdAt = new Date(), _startDate, // Date de début du crédit (quand il devient actif)
    _nextPaymentDate, // Date de la prochaine échéance
    _paidMonths = 0 // Nombre de mois déjà payés
    ) {
        this.id = id;
        this.clientId = clientId;
        this.advisorId = advisorId;
        this.accountId = accountId;
        this._amount = _amount;
        this._annualInterestRate = _annualInterestRate;
        this._insuranceRate = _insuranceRate;
        this._durationMonths = _durationMonths;
        this._monthlyPayment = _monthlyPayment;
        this._remainingCapital = _remainingCapital;
        this._status = _status;
        this.createdAt = createdAt;
        this._startDate = _startDate;
        this._nextPaymentDate = _nextPaymentDate;
        this._paidMonths = _paidMonths;
        this._insuranceMonthlyAmount = 0;
        // Calculer l'assurance mensuelle (basée sur le total du crédit)
        this._insuranceMonthlyAmount = this._calculateInsuranceMonthlyAmount();
    }
    get amount() {
        return this._amount;
    }
    get annualInterestRate() {
        return this._annualInterestRate;
    }
    get insuranceRate() {
        return this._insuranceRate;
    }
    get durationMonths() {
        return this._durationMonths;
    }
    get monthlyPayment() {
        return this._monthlyPayment;
    }
    get remainingCapital() {
        return this._remainingCapital;
    }
    get status() {
        return this._status;
    }
    get startDate() {
        return this._startDate;
    }
    get nextPaymentDate() {
        return this._nextPaymentDate;
    }
    get insuranceMonthlyAmount() {
        return this._insuranceMonthlyAmount;
    }
    get paidMonths() {
        return this._paidMonths;
    }
    /**
     * Calcule l'assurance mensuelle basée sur le total du crédit
     */
    _calculateInsuranceMonthlyAmount() {
        return (this._amount * this._insuranceRate) / 100 / 12;
    }
    /**
     * Calcule la mensualité constante selon la méthode standard
     * Formule : M = C × (t × (1 + t)^n) / ((1 + t)^n - 1)
     * où t = taux mensuel, n = nombre de mois, C = capital
     */
    static calculateMonthlyPayment(amount, annualInterestRate, durationMonths) {
        if (amount <= 0)
            throw new Error("Le montant doit être positif");
        if (annualInterestRate < 0)
            throw new Error("Le taux d'intérêt ne peut pas être négatif");
        if (durationMonths <= 0)
            throw new Error("La durée doit être positive");
        const monthlyRate = annualInterestRate / 100 / 12;
        // Si taux = 0, mensualité = capital / nombre de mois
        if (monthlyRate === 0) {
            return amount / durationMonths;
        }
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, durationMonths);
        const denominator = Math.pow(1 + monthlyRate, durationMonths) - 1;
        const monthlyPayment = amount * (numerator / denominator);
        return Math.round(monthlyPayment * 100) / 100; // Arrondi à 2 décimales
    }
    /**
     * Active le crédit (quand il est versé sur le compte)
     */
    activate() {
        if (this._status !== "pending") {
            throw new Error("Seuls les crédits en attente peuvent être activés");
        }
        this._status = "active";
        this._startDate = new Date();
        this._remainingCapital = this._amount;
        this._updateNextPaymentDate();
    }
    /**
     * Met à jour la date de la prochaine échéance
     */
    _updateNextPaymentDate() {
        if (!this._startDate)
            return;
        const nextDate = new Date(this._startDate);
        nextDate.setMonth(nextDate.getMonth() + this._paidMonths + 1);
        this._nextPaymentDate = nextDate;
    }
    /**
     * Enregistre un paiement mensuel
     * Calcule les intérêts sur le capital restant et déduit le capital remboursé
     */
    recordMonthlyPayment() {
        if (this._status !== "active") {
            throw new Error("Seuls les crédits actifs peuvent avoir des paiements");
        }
        if (this._remainingCapital <= 0) {
            throw new Error("Le crédit est déjà remboursé");
        }
        const monthlyRate = this._annualInterestRate / 100 / 12;
        // Intérêts sur le capital restant
        const interestAmount = Math.round(this._remainingCapital * monthlyRate * 100) / 100;
        // Capital remboursé = mensualité - intérêts - assurance
        const capitalAmount = Math.round((this._monthlyPayment - interestAmount - this._insuranceMonthlyAmount) * 100) / 100;
        // Nouveau capital restant
        const newRemainingCapital = Math.max(0, Math.round((this._remainingCapital - capitalAmount) * 100) / 100);
        this._remainingCapital = newRemainingCapital;
        this._paidMonths += 1;
        this._updateNextPaymentDate();
        // Si le crédit est remboursé
        if (this._remainingCapital <= 0) {
            this._status = "completed";
        }
        return {
            interestAmount,
            capitalAmount,
            insuranceAmount: this._insuranceMonthlyAmount,
            newRemainingCapital,
        };
    }
    /**
     * Annule un crédit en attente
     */
    cancel() {
        if (this._status !== "pending") {
            throw new Error("Seuls les crédits en attente peuvent être annulés");
        }
        this._status = "cancelled";
    }
    /**
     * Retourne le montant total des intérêts qui seront payés sur toute la durée
     */
    getTotalInterestAmount() {
        return (this._monthlyPayment * this._durationMonths) - this._amount;
    }
    /**
     * Retourne le montant total de l'assurance sur toute la durée
     */
    getTotalInsuranceAmount() {
        return this._insuranceMonthlyAmount * this._durationMonths;
    }
    /**
     * Retourne le coût total du crédit (capital + intérêts + assurance)
     */
    getTotalCost() {
        return this._amount + this.getTotalInterestAmount() + this.getTotalInsuranceAmount();
    }
}
exports.Credit = Credit;
