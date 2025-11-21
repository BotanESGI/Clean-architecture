import { Request, Response } from "express";
import { ListAllClients } from "../../application/use-cases/ListAllClients";
import { BanClient } from "../../application/use-cases/BanClient";
import { UnbanClient } from "../../application/use-cases/UnbanClient";
import { UpdateClientInfo } from "../../application/use-cases/UpdateClientInfo";
import { DeleteClient } from "../../application/use-cases/DeleteClient";
import { CreateClientByDirector } from "../../application/use-cases/CreateClientByDirector";
import { SetSavingsRate } from "../../application/use-cases/SetSavingsRate";
import { BankSettingsRepository } from "../../application/repositories/BankSettingsRepository";

export class DirectorController {
  constructor(
    private listAllClients: ListAllClients,
    private banClient: BanClient,
    private unbanClient: UnbanClient,
    private updateClientInfo: UpdateClientInfo,
    private deleteClient: DeleteClient,
    private createClientByDirector: CreateClientByDirector,
    private setSavingsRate: SetSavingsRate,
    private bankSettingsRepo: BankSettingsRepository
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

  getSavingsRate = async (_req: Request, res: Response) => {
    try {
      const rate = await this.bankSettingsRepo.getSavingsRate();
      res.status(200).json({ 
        rate: rate * 100 // Retourner en pourcentage
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  updateSavingsRate = async (req: Request, res: Response) => {
    try {
      const { rate } = req.body;
      if (rate === undefined || rate === null) {
        return res.status(400).json({ message: "Le taux est requis" });
      }
      // Convertir le pourcentage en décimal si nécessaire (ex: 1.5 pour 1.5%)
      const rateDecimal = rate > 1 ? rate / 100 : rate;
      await this.setSavingsRate.execute(rateDecimal);
      res.status(200).json({ 
        message: "Taux d'épargne mis à jour avec succès",
        rate: rateDecimal * 100 // Retourner en pourcentage
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}

