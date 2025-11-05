"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteBeneficiary = void 0;
class DeleteBeneficiary {
    constructor(beneficiaryRepo) {
        this.beneficiaryRepo = beneficiaryRepo;
    }
    async execute(beneficiaryId, ownerClientId) {
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
exports.DeleteBeneficiary = DeleteBeneficiary;
