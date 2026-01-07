import { Request, Response } from "express";
import { SendNotification } from "../../application/use-cases/SendNotification";
import jwt from "jsonwebtoken";

export class NotificationController {
  constructor(private readonly sendNotification: SendNotification) {}

  // POST /advisor/notifications - Envoyer une notification à un client
  send = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string };
      const senderId = decoded.clientId;
      const { receiverId, title, message } = req.body;

      if (!receiverId || !title || !message) {
        return res.status(400).json({ message: "receiverId, title et message requis" });
      }

      await this.sendNotification.execute(senderId, receiverId, title, message);
      res.status(200).json({ message: "Notification envoyée avec succès" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erreur lors de l'envoi de la notification" });
    }
  };
}


