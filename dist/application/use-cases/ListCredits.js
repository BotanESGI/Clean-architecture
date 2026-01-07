"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCredits = void 0;
class ListCredits {
    constructor(creditRepository) {
        this.creditRepository = creditRepository;
    }
    async execute(filters) {
        if (filters?.clientId) {
            return await this.creditRepository.findByClientId(filters.clientId);
        }
        if (filters?.advisorId) {
            return await this.creditRepository.findByAdvisorId(filters.advisorId);
        }
        const allCredits = await this.creditRepository.listAll();
        if (filters?.status) {
            return allCredits.filter((credit) => credit.status === filters.status);
        }
        return allCredits;
    }
}
exports.ListCredits = ListCredits;
