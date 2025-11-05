"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryBeneficiaryRepository = void 0;
class InMemoryBeneficiaryRepository {
    constructor() {
        this.beneficiaries = new Map();
    }
    async create(beneficiary) {
        this.beneficiaries.set(beneficiary.id, beneficiary);
    }
    async findByOwnerId(ownerClientId) {
        const result = [];
        for (const beneficiary of this.beneficiaries.values()) {
            if (beneficiary.ownerClientId === ownerClientId) {
                result.push(beneficiary);
            }
        }
        return result;
    }
    async findByIbanAndOwner(iban, ownerClientId) {
        for (const beneficiary of this.beneficiaries.values()) {
            if (beneficiary.iban === iban && beneficiary.ownerClientId === ownerClientId) {
                return beneficiary;
            }
        }
        return null;
    }
    async delete(id) {
        this.beneficiaries.delete(id);
    }
    async findById(id) {
        return this.beneficiaries.get(id) ?? null;
    }
}
exports.InMemoryBeneficiaryRepository = InMemoryBeneficiaryRepository;
