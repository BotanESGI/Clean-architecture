import { Request, Response } from "express";
import { ListPrivateMessages } from "../../application/use-cases/ListPrivateMessages";
import { SendPrivateMessage } from "../../application/use-cases/SendPrivateMessage";
import { PrivateMessageRepository } from "../../application/repositories/PrivateMessageRepository";
import jwt from "jsonwebtoken";

export class PrivateMessageController {
  constructor(
    private listMessages: ListPrivateMessages,
    private sendMessage: SendPrivateMessage,
    private messageRepo: PrivateMessageRepository
  ) {}

  // GET /private-messages/:advisorId - Liste les messages d'une conversation
  list = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string };
      const clientId = decoded.clientId;
      const { advisorId } = req.params;

      const messages = await this.listMessages.execute(clientId, advisorId);
      res.status(200).json({ messages });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erreur lors de la récupération des messages" });
    }
  };

  // POST /private-messages - Envoie un message
  send = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string };
      const senderId = decoded.clientId;
      const { receiverId, content } = req.body;

      if (!receiverId || !content) {
        return res.status(400).json({ message: "receiverId et content requis" });
      }

      const message = await this.sendMessage.execute(senderId, receiverId, content);
      res.status(201).json({ message });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erreur lors de l'envoi du message" });
    }
  };

  // GET /private-messages/unread/count - Compte les messages non lus
  getUnreadCount = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string };
      const userId = decoded.clientId;

      const count = await this.messageRepo.getUnreadCount(userId);
      res.status(200).json({ count });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erreur" });
    }
  };
}


