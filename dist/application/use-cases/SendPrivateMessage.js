"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendPrivateMessage = void 0;
const PrivateMessage_1 = require("../../domain/entities/PrivateMessage");
const crypto_1 = __importDefault(require("crypto"));
class SendPrivateMessage {
    constructor(messageRepo, clientRepo) {
        this.messageRepo = messageRepo;
        this.clientRepo = clientRepo;
    }
    async execute(senderId, receiverId, content) {
        // Vérifier que le sender existe
        const sender = await this.clientRepo.findById(senderId);
        if (!sender) {
            throw new Error("Expéditeur introuvable");
        }
        // Vérifier que le receiver existe
        const receiver = await this.clientRepo.findById(receiverId);
        if (!receiver) {
            throw new Error("Destinataire introuvable");
        }
        // Vérifier qu'au moins un des deux est un conseiller
        const senderRole = sender.getRole();
        const receiverRole = receiver.getRole();
        if (senderRole !== "ADVISOR" && receiverRole !== "ADVISOR") {
            throw new Error("Les discussions privées sont uniquement entre clients et conseillers");
        }
        // Vérifier qu'un client ne peut pas contacter un autre client
        if (senderRole === "CLIENT" && receiverRole === "CLIENT") {
            throw new Error("Les clients ne peuvent pas se contacter directement");
        }
        // Valider le contenu
        if (!content || content.trim().length === 0) {
            throw new Error("Le message ne peut pas être vide");
        }
        if (content.length > 1000) {
            throw new Error("Le message ne peut pas dépasser 1000 caractères");
        }
        const message = new PrivateMessage_1.PrivateMessage(crypto_1.default.randomUUID(), senderId, receiverId, content.trim(), new Date(), false);
        await this.messageRepo.save(message);
        return message;
    }
}
exports.SendPrivateMessage = SendPrivateMessage;
