import { BeneficiaryRepository } from "../repositories/BeneficiaryRepository";

export class DeleteBeneficiary {
  constructor(private beneficiaryRepo: BeneficiaryRepository) {}

  async execute(beneficiaryId: string, ownerClientId: string) {
    const beneficiary = await this.beneficiaryRepo.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error("Bénéficiaire introuvable");
    }
    if (beneficiary.ownerClientId !== ownerClientId) {
      throw new Error("Vous n'êtes pas autorisé à supprimer ce bénéficiaire");
    }
    await this.beneficiaryRepo.delete(beneficiaryId);
  }
}

