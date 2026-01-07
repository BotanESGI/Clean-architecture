"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPrivateMessages = void 0;
class ListPrivateMessages {
    constructor(messageRepo, clientRepo) {
        this.messageRepo = messageRepo;
        this.clientRepo = clientRepo;
    }
    async execute(clientId, advisorId) {
        // Vérifier que les participants existent
        const client = await this.clientRepo.findById(clientId);
        const advisor = await this.clientRepo.findById(advisorId);
        if (!client) {
            throw new Error("Client introuvable");
        }
        if (!advisor) {
            throw new Error("Conseiller introuvable");
        }
        // Vérifier que c'est bien un conseiller
        if (advisor.getRole() !== "ADVISOR") {
            throw new Error("Le destinataire n'est pas un conseiller");
        }
        // Récupérer les messages de la conversation (dans les deux sens)
        const messages = await this.messageRepo.findByConversation(clientId, advisorId);
        // Trier par date de création
        return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
}
exports.ListPrivateMessages = ListPrivateMessages;
