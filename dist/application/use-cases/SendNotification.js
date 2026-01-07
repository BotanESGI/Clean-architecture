"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendNotification = void 0;
class SendNotification {
    constructor(clientRepo, onNotificationSent) {
        this.clientRepo = clientRepo;
        this.onNotificationSent = onNotificationSent;
    }
    async execute(senderId, receiverId, title, message) {
        // Vérifier que le sender est un conseiller
        const sender = await this.clientRepo.findById(senderId);
        if (!sender) {
            throw new Error("Expéditeur introuvable");
        }
        if (sender.getRole() !== "ADVISOR" && sender.getRole() !== "DIRECTOR") {
            throw new Error("Seuls les conseillers et directeurs peuvent envoyer des notifications");
        }
        // Vérifier que le receiver existe
        const receiver = await this.clientRepo.findById(receiverId);
        if (!receiver) {
            throw new Error("Destinataire introuvable");
        }
        // Valider les données
        if (!title || title.trim().length === 0) {
            throw new Error("Le titre ne peut pas être vide");
        }
        if (!message || message.trim().length === 0) {
            throw new Error("Le message ne peut pas être vide");
        }
        // Notifier via le callback (qui sera connecté au WebSocket)
        this.onNotificationSent(receiverId, title.trim(), message.trim());
    }
}
exports.SendNotification = SendNotification;
