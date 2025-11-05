import { Request, Response } from "express";
import { ListAllClients } from "../../application/use-cases/ListAllClients";
import { UpdateClient } from "../../application/use-cases/UpdateClient";
import { DeleteClient } from "../../application/use-cases/DeleteClient";
import { BanClient } from "../../application/use-cases/BanClient";
import { UnbanClient } from "../../application/use-cases/UnbanClient";
import { CreateClientByDirector } from "../../application/use-cases/CreateClientByDirector";

export class DirectorController {
  constructor(
    private listAllClients: ListAllClients,
    private updateClient: UpdateClient,
    private deleteClient: DeleteClient,
    private banClient: BanClient,
    private unbanClient: UnbanClient,
    private createClient: CreateClientByDirector
  ) {}

  // Liste tous les clients
  listClients = async (_req: Request, res: Response): Promise<void> => {
    try {
      const clients = await this.listAllClients.execute();
      
      const clientsData = clients.map(c => ({
        id: c.getId(),
        firstName: c.getFirstName(),
        lastName: c.getLastName(),
        email: c.getEmail(),
        role: c.getRole(),
        isBanned: c.getIsBanned(),
        isVerified: c.getIsVerified(),
        accountIds: c.getAccountIds()
      }));

      res.status(200).json(clientsData);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Erreur serveur" });
    }
  };

  // Créer un nouveau client
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { firstName, lastName, email, password, role } = req.body;
      
      const result = await this.createClient.execute({
        firstName,
        lastName,
        email,
        password,
        role: role || 'client'
      });

      res.status(201).json({
        message: "Client créé avec succès",
        clientId: result.clientId,
        accountId: result.accountId
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erreur lors de la création" });
    }
  };

  // Modifier un client
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email } = req.body;

      await this.updateClient.execute({
        clientId: id,
        firstName,
        lastName,
        email
      });

      res.status(200).json({ message: "Client modifié avec succès" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erreur lors de la modification" });
    }
  };

  // Supprimer un client
  deleteClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.deleteClient.execute(id);
      res.status(200).json({ message: "Client supprimé avec succès" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erreur lors de la suppression" });
    }
  };

  // Bannir un client
  ban = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.banClient.execute(id);
      res.status(200).json({ message: "Client banni avec succès" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erreur lors du bannissement" });
    }
  };

  // Débannir un client
  unban = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.unbanClient.execute(id);
      res.status(200).json({ message: "Client débanni avec succès" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erreur lors du débannissement" });
    }
  };
}

