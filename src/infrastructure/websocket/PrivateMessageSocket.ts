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
          console.error("WebSocket: Token manquant dans handshake.auth");
          return next(new Error("Token manquant"));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
          console.error("WebSocket: JWT_SECRET non configuré");
          return next(new Error("JWT_SECRET non configuré"));
        }

        const decoded = jwt.verify(token, secret) as { clientId: string; role?: string };
        const client = await this.clientRepo.findById(decoded.clientId);
        
        if (!client) {
          console.error(`WebSocket: Utilisateur introuvable pour clientId: ${decoded.clientId}`);
          return next(new Error("Utilisateur introuvable"));
        }

        socket.data.userId = decoded.clientId;
        socket.data.role = client.getRole();
        next();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("WebSocket: Erreur d'authentification:", errorMessage);
        if (error instanceof jwt.JsonWebTokenError) {
          console.error("   Type:", error.name);
        }
        next(new Error(`Token invalide: ${errorMessage}`));
      }
    });

    // Gérer les erreurs de connexion
    this.io.on("connection_error", (error) => {
      console.error("WebSocket: Erreur de connexion:", error.message || error);
    });

    this.io.on("connection", (socket) => {
      const userId = socket.data.userId;
      const role = socket.data.role;

      // Enregistrer l'utilisateur
      this.users.set(userId, { userId, role, socketId: socket.id });
      this.socketToUser.set(socket.id, userId);

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
            const response = { messages, isOtherUserOnline: Boolean(isOtherUserOnline) };
            socket.emit("conversation_loaded", response);
            
            // Si le conseiller est connecté, envoyer l'événement user_online au client
            // pour qu'il voie que le conseiller est en ligne
            if (isOtherUserOnline) {
              // Émettre au socket du client qui a chargé la conversation
              socket.emit("user_online", { userId: otherUserId, role: "ADVISOR" });
            }
          } else if (role === "ADVISOR" && data.clientId) {
            // Le conseiller charge une conversation avec un client
            otherUserId = data.clientId;
            const messages = await this.listMessagesUseCase.execute(data.clientId, userId);
            isOtherUserOnline = this.users.has(otherUserId);
            const response = { messages, isOtherUserOnline: Boolean(isOtherUserOnline) };
            socket.emit("conversation_loaded", response);
            
            // Envoyer l'événement user_online au client pour qu'il voie que le conseiller est en ligne
            const clientSocket = Array.from(this.io.sockets.sockets.values()).find(
              s => s.data.userId === otherUserId
            );
            if (clientSocket) {
              // Émettre avec userId = l'ID du conseiller (celui qui charge la conversation)
              clientSocket.emit("user_online", { userId, role: "ADVISOR" });
            }
          } else {
            console.error(`Paramètres invalides - role: ${role}, advisorId: ${data.advisorId}, clientId: ${data.clientId}`);
            socket.emit("error", { message: `Paramètres invalides - role: ${role}, advisorId: ${data.advisorId}, clientId: ${data.clientId}` });
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
        // Envoyer le statut au destinataire avec l'ID de l'expéditeur (celui qui tape)
        const receiverUser = this.users.get(data.receiverId);
        if (receiverUser) {
          // Émettre l'événement typing au destinataire avec userId = l'ID de celui qui tape
          // userId est l'ID de celui qui envoie l'événement (celui qui tape)
          // data.receiverId est l'ID du destinataire (celui qui doit voir l'indicateur)
          this.io.to(`user:${data.receiverId}`).emit("typing", {
            userId: userId,
            isTyping: data.isTyping,
          });
        }
      });

      // Notifier tous les utilisateurs connectés que cet utilisateur est maintenant en ligne
      // (Tous les utilisateurs connectés pourront voir le statut)
      // Émettre après un court délai pour s'assurer que l'utilisateur est bien enregistré
      setTimeout(() => {
        // Si c'est un conseiller qui vient de se connecter, notifier tous les clients connectés
        if (role === "ADVISOR") {
          const clients = Array.from(this.users.values()).filter(u => u.role === "CLIENT");
          
          // Émettre d'abord à tous les clients individuellement
          clients.forEach(client => {
            const clientSocket = Array.from(this.io.sockets.sockets.values()).find(
              s => s.data.userId === client.userId
            );
            if (clientSocket) {
              // Émettre l'événement avec userId = l'ID du conseiller qui vient de se connecter
              clientSocket.emit("user_online", { userId, role: "ADVISOR" });
            }
          });
        } 
        // Si c'est un client qui vient de se connecter, notifier tous les conseillers connectés
        else if (role === "CLIENT") {
          const advisors = Array.from(this.users.values()).filter(u => u.role === "ADVISOR");
          
          advisors.forEach(advisor => {
            const advisorSocket = Array.from(this.io.sockets.sockets.values()).find(
              s => s.data.userId === advisor.userId
            );
            if (advisorSocket) {
              // Émettre l'événement avec userId = l'ID du client qui vient de se connecter
              advisorSocket.emit("user_online", { userId, role: "CLIENT" });
            }
          });
        }
        
        // Également émettre à tous pour compatibilité (mais les listeners spécifiques devraient déjà l'avoir capturé)
        this.io.emit("user_online", { userId, role });
      }, 200);

      // Gérer la déconnexion
      socket.on("disconnect", () => {
        this.users.delete(userId);
        this.socketToUser.delete(socket.id);
        
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

