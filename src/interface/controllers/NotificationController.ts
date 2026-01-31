import { Request, Response } from "express";
import { SendNotification } from "../../application/use-cases/SendNotification";
import { ListNotifications } from "../../application/use-cases/ListNotifications";
import { MarkNotificationAsRead } from "../../application/use-cases/MarkNotificationAsRead";
import { GetUnreadNotificationCount } from "../../application/use-cases/GetUnreadNotificationCount";
import jwt from "jsonwebtoken";

export class NotificationController {
  constructor(
    private readonly sendNotification: SendNotification,
    private readonly listNotifications: ListNotifications,
    private readonly markNotificationAsRead: MarkNotificationAsRead,
    private readonly getUnreadCount: GetUnreadNotificationCount
  ) {}

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

  // GET /notifications - Lister les notifications du client connecté
  list = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string };
      const receiverId = decoded.clientId;

      const notifications = await this.listNotifications.execute(receiverId);
      res.status(200).json({ notifications });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erreur lors de la récupération des notifications" });
    }
  };

  // POST /notifications/:id/read - Marquer une notification comme lue
  markAsRead = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string };
      const receiverId = decoded.clientId;
      const { id } = req.params;

      await this.markNotificationAsRead.execute(id, receiverId);
      res.status(200).json({ message: "Notification marquée comme lue" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erreur lors du marquage de la notification" });
    }
  };

  // GET /notifications/unread-count - Obtenir le nombre de notifications non lues
  unreadCount = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { clientId: string };
      const receiverId = decoded.clientId;

      const count = await this.getUnreadCount.execute(receiverId);
      res.status(200).json({ count });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Erreur lors de la récupération du nombre de notifications" });
    }
  };
}


