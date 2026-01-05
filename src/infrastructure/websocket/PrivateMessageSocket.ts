import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { SendPrivateMessage } from "../../application/use-cases/SendPrivateMessage";
import { ListPrivateMessages } from "../../application/use-cases/ListPrivateMessages";
import { ClientRepository } from "../../application/repositories/ClientRepository";

interface SocketUser {
  userId: string;
  role: string;
  socketId: string;
}

export class PrivateMessageSocket {
  private io: SocketIOServer;
  private users: Map<string, SocketUser> = new Map(); // userId -> SocketUser
  private socketToUser: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    httpServer: HTTPServer,
    private sendMessageUseCase: SendPrivateMessage,
    private listMessagesUseCase: ListPrivateMessages,
    private clientRepo: ClientRepository
  ) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONT_ORIGIN?.split(",") || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      path: "/socket.io"
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Token manquant"));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
          return next(new Error("JWT_SECRET non configuré"));
        }

        const decoded = jwt.verify(token, secret) as { clientId: string; role?: string };
        const client = await this.clientRepo.findById(decoded.clientId);
        
        if (!client) {
          return next(new Error("Utilisateur introuvable"));
        }

        socket.data.userId = decoded.clientId;
        socket.data.role = client.getRole();
        next();
      } catch (error) {
        next(new Error("Token invalide"));
      }
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
      socket.on("load_conversation", async (data: { advisorId?: string; clientId?: string }) => {
        try {
          let otherUserId: string | null = null;
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
          } else if (role === "ADVISOR" && data.clientId) {
            // Le conseiller charge une conversation avec un client
            otherUserId = data.clientId;
            const messages = await this.listMessagesUseCase.execute(data.clientId, userId);
            isOtherUserOnline = this.users.has(otherUserId);
            console.log(`📨 Conseiller ${userId} charge conversation avec client ${otherUserId}, statut: ${isOtherUserOnline}`);
            console.log(`👥 Utilisateurs connectés:`, Array.from(this.users.keys()));
            const response = { messages, isOtherUserOnline: Boolean(isOtherUserOnline) };
            console.log(`📤 Envoi conversation_loaded:`, JSON.stringify({ messagesCount: messages.length, isOtherUserOnline: response.isOtherUserOnline }));
            socket.emit("conversation_loaded", response);
          } else {
            socket.emit("error", { message: "Paramètres invalides" });
          }
        } catch (error) {
          socket.emit("error", { message: error instanceof Error ? error.message : "Erreur" });
        }
      });

      // Écouter l'événement pour envoyer un message
      socket.on("send_message", async (data: { receiverId: string; content: string }) => {
        try {
          const message = await this.sendMessageUseCase.execute(
            userId,
            data.receiverId,
            data.content
          );

          // Envoyer le message à l'expéditeur (confirmation)
          socket.emit("message_sent", { message });

          // Envoyer le message au destinataire s'il est connecté
          const receiverUser = this.users.get(data.receiverId);
          if (receiverUser) {
            this.io.to(`user:${data.receiverId}`).emit("new_message", { message });
          }
        } catch (error) {
          socket.emit("error", { message: error instanceof Error ? error.message : "Erreur" });
        }
      });

      // Écouter l'événement "en train d'écrire"
      socket.on("typing", (data: { receiverId: string; isTyping: boolean }) => {
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
  sendMessageToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}

