export type CreditStatus = "pending" | "active" | "completed" | "cancelled";

export class Credit {
  constructor(
    public readonly id: string,
    public readonly clientId: string, // Client qui a reçu le crédit
    public readonly advisorId: string, // Conseiller qui a octroyé le crédit
    public readonly accountId: string, // Compte sur lequel le crédit est versé
    private _amount: number, // Montant total du crédit
    private _annualInterestRate: number, // Taux annuel d'intérêts (en pourcentage, ex: 3.5 pour 3.5%)
    private _insuranceRate: number, // Taux d'assurance (en pourcentage, ex: 0.5 pour 0.5%)
    private _durationMonths: number, // Durée en mois
    private _monthlyPayment: number, // Mensualité constante calculée
    private _remainingCapital: number, // Capital restant dû
    private _status: CreditStatus = "pending",
    public readonly createdAt: Date = new Date(),
    private _startDate?: Date, // Date de début du crédit (quand il devient actif)
    private _nextPaymentDate?: Date, // Date de la prochaine échéance
    private _paidMonths: number = 0 // Nombre de mois déjà payés
  ) {
    // Calculer l'assurance mensuelle (basée sur le total du crédit)
    this._insuranceMonthlyAmount = this._calculateInsuranceMonthlyAmount();
  }

  private _insuranceMonthlyAmount: number = 0;

  get amount(): number {
    return this._amount;
  }

  get annualInterestRate(): number {
    return this._annualInterestRate;
  }

  get insuranceRate(): number {
    return this._insuranceRate;
  }

  get durationMonths(): number {
    return this._durationMonths;
  }

  get monthlyPayment(): number {
    return this._monthlyPayment;
  }

  get remainingCapital(): number {
    return this._remainingCapital;
  }

  get status(): CreditStatus {
    return this._status;
  }

  get startDate(): Date | undefined {
    return this._startDate;
  }

  get nextPaymentDate(): Date | undefined {
    return this._nextPaymentDate;
  }

  get insuranceMonthlyAmount(): number {
    return this._insuranceMonthlyAmount;
  }

  get paidMonths(): number {
    return this._paidMonths;
  }

  /**
   * Calcule l'assurance mensuelle basée sur le total du crédit
   */
  private _calculateInsuranceMonthlyAmount(): number {
    return (this._amount * this._insuranceRate) / 100 / 12;
  }

  /**
   * Calcule la mensualité constante selon la méthode standard
   * Formule : M = C × (t × (1 + t)^n) / ((1 + t)^n - 1)
   * où t = taux mensuel, n = nombre de mois, C = capital
   */
  static calculateMonthlyPayment(
    amount: number,
    annualInterestRate: number,
    durationMonths: number
  ): number {
    if (amount <= 0) throw new Error("Le montant doit être positif");
    if (annualInterestRate < 0) throw new Error("Le taux d'intérêt ne peut pas être négatif");
    if (durationMonths <= 0) throw new Error("La durée doit être positive");

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
  activate(): void {
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
  private _updateNextPaymentDate(): void {
    if (!this._startDate) return;
    const nextDate = new Date(this._startDate);
    nextDate.setMonth(nextDate.getMonth() + this._paidMonths + 1);
    this._nextPaymentDate = nextDate;
  }

  /**
   * Enregistre un paiement mensuel
   * Calcule les intérêts sur le capital restant et déduit le capital remboursé
   */
  recordMonthlyPayment(): {
    interestAmount: number;
    capitalAmount: number;
    insuranceAmount: number;
    newRemainingCapital: number;
  } {
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
  cancel(): void {
    if (this._status !== "pending") {
      throw new Error("Seuls les crédits en attente peuvent être annulés");
    }
    this._status = "cancelled";
  }

  /**
   * Retourne le montant total des intérêts qui seront payés sur toute la durée
   */
  getTotalInterestAmount(): number {
    return (this._monthlyPayment * this._durationMonths) - this._amount;
  }

  /**
   * Retourne le montant total de l'assurance sur toute la durée
   */
  getTotalInsuranceAmount(): number {
    return this._insuranceMonthlyAmount * this._durationMonths;
  }

  /**
   * Retourne le coût total du crédit (capital + intérêts + assurance)
   */
  getTotalCost(): number {
    return this._amount + this.getTotalInterestAmount() + this.getTotalInsuranceAmount();
  }
}

