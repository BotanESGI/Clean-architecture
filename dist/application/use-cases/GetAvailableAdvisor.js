"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAvailableAdvisor = void 0;
class GetAvailableAdvisor {
    constructor(clientRepo) {
        this.clientRepo = clientRepo;
    }
    async execute() {
        // Trouver le premier conseiller disponible
        // Pour simplifier, on prend le conseiller avec l'ID fixe "advisor-001"
        // ou on peut lister tous les conseillers et en prendre un
        const advisor = await this.clientRepo.findById("advisor-001");
        if (!advisor || advisor.getRole() !== "ADVISOR") {
            throw new Error("Aucun conseiller disponible");
        }
        return advisor;
    }
}
exports.GetAvailableAdvisor = GetAvailableAdvisor;
