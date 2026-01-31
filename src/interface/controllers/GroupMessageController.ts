import { Request, Response } from "express";
import { ListGroupMessages } from "../../application/use-cases/ListGroupMessages";
import { SendGroupMessage } from "../../application/use-cases/SendGroupMessage";
import jwt from "jsonwebtoken";

export class GroupMessageController {
  constructor(
    private listMessages: ListGroupMessages,
    private sendMessage: SendGroupMessage
  ) {}

  // GET /group-messages - Liste les messages de groupe
  list = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string; role?: string };
      
      // Vérifier que l'utilisateur est un conseiller ou un directeur
      if (decoded.role !== "ADVISOR" && decoded.role !== "DIRECTOR") {
        return res.status(403).json({ message: "Accès refusé. Seuls les conseillers et directeurs peuvent accéder à la discussion de groupe." });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const messages = await this.listMessages.execute(limit);
      res.status(200).json({ messages });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erreur lors de la récupération des messages" });
    }
  };

  // POST /group-messages - Envoie un message de groupe
  send = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string; role?: string };
      const senderId = decoded.clientId;
      const { content } = req.body;

      // Vérifier que l'utilisateur est un conseiller ou un directeur
      if (decoded.role !== "ADVISOR" && decoded.role !== "DIRECTOR") {
        return res.status(403).json({ message: "Accès refusé. Seuls les conseillers et directeurs peuvent envoyer des messages de groupe." });
      }

      if (!content) {
        return res.status(400).json({ message: "content requis" });
      }

      const message = await this.sendMessage.execute(senderId, content);
      res.status(201).json({ message });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erreur lors de l'envoi du message" });
    }
  };
}
