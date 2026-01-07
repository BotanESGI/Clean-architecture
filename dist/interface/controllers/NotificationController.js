"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class NotificationController {
    constructor(sendNotification) {
        this.sendNotification = sendNotification;
        // POST /advisor/notifications - Envoyer une notification à un client
        this.send = async (req, res) => {
            try {
                const token = req.headers.authorization?.replace("Bearer ", "");
                if (!token) {
                    return res.status(401).json({ message: "Token manquant" });
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const senderId = decoded.clientId;
                const { receiverId, title, message } = req.body;
                if (!receiverId || !title || !message) {
                    return res.status(400).json({ message: "receiverId, title et message requis" });
                }
                await this.sendNotification.execute(senderId, receiverId, title, message);
                res.status(200).json({ message: "Notification envoyée avec succès" });
            }
            catch (err) {
                res.status(400).json({ message: err.message || "Erreur lors de l'envoi de la notification" });
            }
        };
    }
}
exports.NotificationController = NotificationController;
