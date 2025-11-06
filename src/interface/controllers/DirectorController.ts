import { Request, Response } from "express";
import { ListAllClients } from "../../application/use-cases/ListAllClients";
import { BanClient } from "../../application/use-cases/BanClient";
import { UnbanClient } from "../../application/use-cases/UnbanClient";
import { UpdateClientInfo } from "../../application/use-cases/UpdateClientInfo";
import { DeleteClient } from "../../application/use-cases/DeleteClient";
import { CreateClientByDirector } from "../../application/use-cases/CreateClientByDirector";

export class DirectorController {
  constructor(
    private listAllClients: ListAllClients,
    private banClient: BanClient,
    private unbanClient: UnbanClient,
    private updateClientInfo: UpdateClientInfo,
    private deleteClient: DeleteClient,
    private createClientByDirector: CreateClientByDirector
  ) {}

  createClient = async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      const result = await this.createClientByDirector.execute(firstName, lastName, email, password);
      res.status(201).json({ 
        message: "Client créé avec succès", 
        client: result.client,
        account: result.account
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  listClients = async (_req: Request, res: Response) => {
    try {
      const clients = await this.listAllClients.execute();
      res.status(200).json({ clients });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  ban = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.banClient.execute(id);
      res.status(200).json({ message: "Client banni avec succès" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  unban = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.unbanClient.execute(id);
      res.status(200).json({ message: "Client débanni avec succès" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email } = req.body;
      await this.updateClientInfo.execute(id, { firstName, lastName, email });
      res.status(200).json({ message: "Client modifié avec succès" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.deleteClient.execute(id);
      res.status(200).json({ message: "Client supprimé avec succès" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}

