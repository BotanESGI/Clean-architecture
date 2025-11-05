import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    clientId: string;
    role: string;
  };
}

export const checkDirector = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token manquant" });
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Configuration serveur invalide" });
    }

    const decoded = jwt.verify(token, secret) as { clientId: string; role: string };
    
    if (decoded.role !== 'director') {
      return res.status(403).json({ error: "Accès refusé. Réservé aux directeurs." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

