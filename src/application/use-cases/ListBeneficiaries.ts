import { BeneficiaryRepository } from "../repositories/BeneficiaryRepository";

export class ListBeneficiaries {
  constructor(private beneficiaryRepo: BeneficiaryRepository) {}

  async execute(ownerClientId: string) {
    return await this.beneficiaryRepo.findByOwnerId(ownerClientId);
  }
}

