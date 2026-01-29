import { Request, Response } from "express";
import { CreateActivity } from "../../application/use-cases/CreateActivity";
import { ListPublishedActivities } from "../../application/use-cases/ListPublishedActivities";

/** Callback appelé quand une nouvelle actualité est créée (pour SSE). */
export type OnActivityCreated = (activity: { id: string; title: string; content: string; authorId: string; createdAt: Date }) => void;

/** Liste des clients connectés au flux SSE des actualités. */
const sseClients: Response[] = [];

export class ActivityController {
  constructor(
    private readonly createActivity: CreateActivity,
    private readonly listPublishedActivities: ListPublishedActivities
  ) {}

  /** POST /advisor/activities - Créer une actualité (conseiller/directeur). */
  create = async (req: Request, res: Response) => {
    try {
      const authorId = (req as any).user?.clientId;
      if (!authorId) {
        return res.status(401).json({ message: "Non authentifié" });
      }
      const { title, content } = req.body;
      if (!title || !content) {
        return res.status(400).json({ message: "title et content requis" });
      }

      const activity = await this.createActivity.execute(authorId, title, content);
      const payload = {
        id: activity.id,
        title: activity.title,
        content: activity.content,
        authorId: activity.authorId,
        createdAt: activity.createdAt,
      };

      // Notifier tous les clients SSE
      sseClients.forEach((clientRes) => {
        try {
          clientRes.write(`data: ${JSON.stringify({ type: "activity", ...payload })}\n\n`);
        } catch (_) {}
      });

      res.status(201).json({ message: "Actualité créée", activity: payload });
    } catch (err: any) {
      const msg = err?.message || "Erreur lors de la création de l'actualité";
      const isServerError = msg.includes("doesn't exist") || msg.includes("ECONNREFUSED") || msg.includes("ER_NO_SUCH_TABLE");
      res.status(isServerError ? 500 : 400).json({ message: msg });
    }
  };

  /** GET /activities - Liste des actualités publiées (clients). */
  list = async (_req: Request, res: Response) => {
    try {
      const activities = await this.listPublishedActivities.execute();
      res.status(200).json({ activities });
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erreur lors de la récupération des actualités" });
    }
  };

  /** GET /activities/stream - Flux SSE des actualités en temps réel. */
  stream = (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    sseClients.push(res);
    res.on("close", () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  };
}
