import { BeneficiaryRepository } from "../../../application/repositories/BeneficiaryRepository";
import { Beneficiary } from "../../../domain/entities/Beneficiary";

export class InMemoryBeneficiaryRepository implements BeneficiaryRepository {
  private beneficiaries = new Map<string, Beneficiary>();

  async create(beneficiary: Beneficiary): Promise<void> {
    this.beneficiaries.set(beneficiary.id, beneficiary);
  }

  async findByOwnerId(ownerClientId: string): Promise<Beneficiary[]> {
    const result: Beneficiary[] = [];
    for (const beneficiary of this.beneficiaries.values()) {
      if (beneficiary.ownerClientId === ownerClientId) {
        result.push(beneficiary);
      }
    }
    return result;
  }

  async findByIbanAndOwner(iban: string, ownerClientId: string): Promise<Beneficiary | null> {
    for (const beneficiary of this.beneficiaries.values()) {
      if (beneficiary.iban === iban && beneficiary.ownerClientId === ownerClientId) {
        return beneficiary;
      }
    }
    return null;
  }

  async delete(id: string): Promise<void> {
    this.beneficiaries.delete(id);
  }

  async findById(id: string): Promise<Beneficiary | null> {
    return this.beneficiaries.get(id) ?? null;
  }
}

