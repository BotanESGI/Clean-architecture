import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { SendGroupMessage } from "../../application/use-cases/SendGroupMessage";
import { ListGroupMessages } from "../../application/use-cases/ListGroupMessages";
import { ClientRepository } from "../../application/repositories/ClientRepository";

interface SocketUser {
  userId: string;
  role: string;
  socketId: string;
}

export class GroupMessageSocket {
  private users: Map<string, SocketUser> = new Map(); // userId -> SocketUser
  private socketToUser: Map<string, string> = new Map(); // socketId -> userId
  private readonly GROUP_ROOM = "group_chat";

  constructor(
    private io: SocketIOServer,
    private sendMessageUseCase: SendGroupMessage,
    private listMessagesUseCase: ListGroupMessages,
    private clientRepo: ClientRepository
  ) {
    // Note: Les handlers sont maintenant dans PrivateMessageSocket
    // Cette classe est conservée pour compatibilité mais n'est plus utilisée
  }

  // Note: Les handlers sont maintenant dans PrivateMessageSocket
  // Cette méthode n'est plus utilisée

  getIO(): SocketIOServer {
    return this.io;
  }
}
