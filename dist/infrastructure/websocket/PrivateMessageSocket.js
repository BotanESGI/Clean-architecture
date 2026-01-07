"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateMessageSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class PrivateMessageSocket {
    constructor(httpServer, sendMessageUseCase, listMessagesUseCase, clientRepo) {
        this.sendMessageUseCase = sendMessageUseCase;
        this.listMessagesUseCase = listMessagesUseCase;
        this.clientRepo = clientRepo;
        this.users = new Map(); // userId -> SocketUser
        this.socketToUser = new Map(); // socketId -> userId
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.FRONT_ORIGIN?.split(",") || "http://localhost:3000",
                methods: ["GET", "POST"]
            },
            path: "/socket.io"
        });
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    console.error("❌ WebSocket: Token manquant dans handshake.auth");
                    return next(new Error("Token manquant"));
                }
                const secret = process.env.JWT_SECRET;
                if (!secret) {
                    console.error("❌ WebSocket: JWT_SECRET non configuré");
                    return next(new Error("JWT_SECRET non configuré"));
                }
                const decoded = jsonwebtoken_1.default.verify(token, secret);
                const client = await this.clientRepo.findById(decoded.clientId);
                if (!client) {
                    console.error(`❌ WebSocket: Utilisateur introuvable pour clientId: ${decoded.clientId}`);
                    return next(new Error("Utilisateur introuvable"));
                }
                socket.data.userId = decoded.clientId;
                socket.data.role = client.getRole();
                console.log(`✅ WebSocket: Authentification réussie pour ${decoded.clientId} (${client.getRole()})`);
                next();
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
                console.error("❌ WebSocket: Erreur d'authentification:", errorMessage);
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    console.error("   Type:", error.name);
                }
                next(new Error(`Token invalide: ${errorMessage}`));
            }
        });
        // Gérer les erreurs de connexion
        this.io.on("connection_error", (error) => {
            console.error("❌ WebSocket: Erreur de connexion:", error.message || error);
        });
        this.io.on("connection", (socket) => {
            const userId = socket.data.userId;
            const role = socket.data.role;
            // Enregistrer l'utilisateur
            this.users.set(userId, { userId, role, socketId: socket.id });
            this.socketToUser.set(socket.id, userId);
            console.log(`🔌 Utilisateur connecté: ${userId} (${role})`);
            // Joindre la room de l'utilisateur pour recevoir ses messages
            socket.join(`user:${userId}`);
            // Écouter l'événement pour charger l'historique d'une conversation
            socket.on("load_conversation", async (data) => {
                try {
                    console.log(`📨 load_conversation reçu - userId: ${userId}, role: ${role}, data:`, data);
                    let otherUserId = null;
                    let isOtherUserOnline = false;
                    if (role === "CLIENT" && data.advisorId) {
                        // Le client charge une conversation avec un conseiller
                        otherUserId = data.advisorId;
                        const messages = await this.listMessagesUseCase.execute(userId, data.advisorId);
                        isOtherUserOnline = this.users.has(otherUserId);
                        console.log(`📨 Client ${userId} charge conversation avec conseiller ${otherUserId}, statut: ${isOtherUserOnline}`);
                        console.log(`👥 Utilisateurs connectés:`, Array.from(this.users.keys()));
                        const response = { messages, isOtherUserOnline: Boolean(isOtherUserOnline) };
                        console.log(`📤 Envoi conversation_loaded:`, JSON.stringify({ messagesCount: messages.length, isOtherUserOnline: response.isOtherUserOnline }));
                        socket.emit("conversation_loaded", response);
                    }
                    else if (role === "ADVISOR" && data.clientId) {
                        // Le conseiller charge une conversation avec un client
                        otherUserId = data.clientId;
                        const messages = await this.listMessagesUseCase.execute(data.clientId, userId);
                        isOtherUserOnline = this.users.has(otherUserId);
                        console.log(`📨 Conseiller ${userId} charge conversation avec client ${otherUserId}, statut: ${isOtherUserOnline}`);
                        console.log(`👥 Utilisateurs connectés:`, Array.from(this.users.keys()));
                        const response = { messages, isOtherUserOnline: Boolean(isOtherUserOnline) };
                        console.log(`📤 Envoi conversation_loaded:`, JSON.stringify({ messagesCount: messages.length, isOtherUserOnline: response.isOtherUserOnline }));
                        socket.emit("conversation_loaded", response);
                    }
                    else {
                        console.error(`❌ Paramètres invalides - role: ${role}, advisorId: ${data.advisorId}, clientId: ${data.clientId}`);
                        socket.emit("error", { message: `Paramètres invalides - role: ${role}, advisorId: ${data.advisorId}, clientId: ${data.clientId}` });
                    }
                }
                catch (error) {
                    socket.emit("error", { message: error instanceof Error ? error.message : "Erreur" });
                }
            });
            // Écouter l'événement pour envoyer un message
            socket.on("send_message", async (data) => {
                try {
                    const message = await this.sendMessageUseCase.execute(userId, data.receiverId, data.content);
                    // Envoyer le message à l'expéditeur (confirmation)
                    socket.emit("message_sent", { message });
                    // Envoyer le message au destinataire s'il est connecté
                    const receiverUser = this.users.get(data.receiverId);
                    if (receiverUser) {
                        this.io.to(`user:${data.receiverId}`).emit("new_message", { message });
                    }
                }
                catch (error) {
                    socket.emit("error", { message: error instanceof Error ? error.message : "Erreur" });
                }
            });
            // Écouter l'événement "en train d'écrire"
            socket.on("typing", (data) => {
                // Envoyer le statut au destinataire
                const receiverUser = this.users.get(data.receiverId);
                if (receiverUser) {
                    this.io.to(`user:${data.receiverId}`).emit("typing", {
                        userId,
                        isTyping: data.isTyping,
                    });
                }
            });
            // Notifier tous les utilisateurs connectés que cet utilisateur est maintenant en ligne
            // (Tous les utilisateurs connectés pourront voir le statut)
            // Émettre après un court délai pour s'assurer que l'utilisateur est bien enregistré
            setTimeout(() => {
                this.io.emit("user_online", { userId, role });
            }, 100);
            // Gérer la déconnexion
            socket.on("disconnect", () => {
                this.users.delete(userId);
                this.socketToUser.delete(socket.id);
                console.log(`🔌 Utilisateur déconnecté: ${userId}`);
                // Notifier tous les utilisateurs connectés que cet utilisateur est maintenant hors ligne
                this.io.emit("user_offline", { userId, role });
            });
        });
    }
    // Méthode pour envoyer un message depuis le serveur (pour les notifications)
    sendMessageToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    getIO() {
        return this.io;
    }
}
exports.PrivateMessageSocket = PrivateMessageSocket;
