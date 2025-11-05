"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListBeneficiaries = void 0;
class ListBeneficiaries {
    constructor(beneficiaryRepo) {
        this.beneficiaryRepo = beneficiaryRepo;
    }
    async execute(ownerClientId) {
        return await this.beneficiaryRepo.findByOwnerId(ownerClientId);
    }
}
exports.ListBeneficiaries = ListBeneficiaries;
