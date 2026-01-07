import { Request, Response } from "express";
import { RegisterClient } from "../../application/use-cases/RegisterClient";
import { ConfirmClientRegistration } from "../../application/use-cases/ConfirmRegistration";
import { LoginClient } from "../../application/use-cases/LoginClient";
import { ClientRepository } from "../../application/repositories/ClientRepository";

export class ClientController {
  constructor(
    private registerClient: RegisterClient,
    private confirmClient: ConfirmClientRegistration,
    private loginClient: LoginClient,
    private clientRepo?: ClientRepository
  ) {}

  register = async (req: Request, res: Response) => {
    try {
      const { firstname, lastname, email, password } = req.body;
      const client = await this.registerClient.execute(firstname, lastname, email, password);
      res.status(201).json({ message: "Client enregistré, lien envoyé par email", client });
    } catch (err: any) {
      res.status(400).json({ message: err?.message || "Erreur lors de l'inscription" });
    }
  };

  confirm = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const account = await this.confirmClient.execute(token);
      res.status(200).json({
        message: "Compte confirmé avec succès",
        account
      });
    } catch (err: any) {
      const message = err?.message || "Erreur lors de la confirmation";
      if (message.includes("déjà confirmé")) {
        res.status(200).json({
          message: "Compte déjà confirmé",
          account: null
        });
      } else {
        res.status(400).json({ message });
      }
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const { token, role } = await this.loginClient.execute(email, password);
      res.status(200).json({ message: "Connexion réussie", token, role });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  // GET /clients/:id → minimal profile
  getById = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    if (!this.clientRepo) return res.status(500).json({ message: "Repo manquant" });
    const c = await this.clientRepo.findById(id);
    if (!c) return res.status(404).json({ message: "Client introuvable" });
    res.status(200).json({ id: c.getId(), firstname: c.getFirstName(), lastname: c.getLastName(), email: c.getEmail(), verified: c.getIsVerified() });
  };
}
