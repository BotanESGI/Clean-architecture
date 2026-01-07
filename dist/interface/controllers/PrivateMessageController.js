"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateMessageController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class PrivateMessageController {
    constructor(listMessages, sendMessage, messageRepo) {
        this.listMessages = listMessages;
        this.sendMessage = sendMessage;
        this.messageRepo = messageRepo;
        // GET /private-messages/:advisorId - Liste les messages d'une conversation
        this.list = async (req, res) => {
            try {
                const token = req.headers.authorization?.replace("Bearer ", "");
                if (!token) {
                    return res.status(401).json({ message: "Token manquant" });
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const clientId = decoded.clientId;
                const { advisorId } = req.params;
                const messages = await this.listMessages.execute(clientId, advisorId);
                res.status(200).json({ messages });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Erreur lors de la récupération des messages" });
            }
        };
        // POST /private-messages - Envoie un message
        this.send = async (req, res) => {
            try {
                const token = req.headers.authorization?.replace("Bearer ", "");
                if (!token) {
                    return res.status(401).json({ message: "Token manquant" });
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const senderId = decoded.clientId;
                const { receiverId, content } = req.body;
                if (!receiverId || !content) {
                    return res.status(400).json({ message: "receiverId et content requis" });
                }
                const message = await this.sendMessage.execute(senderId, receiverId, content);
                res.status(201).json({ message });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Erreur lors de l'envoi du message" });
            }
        };
        // GET /private-messages/unread/count - Compte les messages non lus
        this.getUnreadCount = async (req, res) => {
            try {
                const token = req.headers.authorization?.replace("Bearer ", "");
                if (!token) {
                    return res.status(401).json({ message: "Token manquant" });
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const userId = decoded.clientId;
                const count = await this.messageRepo.getUnreadCount(userId);
                res.status(200).json({ count });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Erreur" });
            }
        };
    }
}
exports.PrivateMessageController = PrivateMessageController;
