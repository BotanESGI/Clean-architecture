import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  clientId: string;
  role: string;
}

export function requireDirector(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token d'authentification manquant" });
    }

    const token = authHeader.substring(7);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Configuration serveur invalide" });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (decoded.role !== "DIRECTOR") {
      return res.status(403).json({ message: "Accès refusé. Seuls les directeurs peuvent accéder à cette ressource." });
    }

    (req as any).user = {
      clientId: decoded.clientId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token invalide" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expiré" });
    }
    return res.status(500).json({ message: "Erreur lors de la vérification du token" });
  }
}

