export class Beneficiary {
  constructor(
    public readonly id: string,
    public readonly ownerClientId: string, // Client qui a ajouté ce bénéficiaire
    public readonly iban: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly accountName: string, // Nom du compte du bénéficiaire
    public readonly createdAt: Date = new Date()
  ) {}

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

