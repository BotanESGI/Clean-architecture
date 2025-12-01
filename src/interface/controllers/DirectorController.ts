import { Request, Response } from "express";
import { ListAllClients } from "../../application/use-cases/ListAllClients";
import { BanClient } from "../../application/use-cases/BanClient";
import { UnbanClient } from "../../application/use-cases/UnbanClient";
import { UpdateClientInfo } from "../../application/use-cases/UpdateClientInfo";
import { DeleteClient } from "../../application/use-cases/DeleteClient";
import { CreateClientByDirector } from "../../application/use-cases/CreateClientByDirector";
import { SetSavingsRate } from "../../application/use-cases/SetSavingsRate";
import { BankSettingsRepository } from "../../application/repositories/BankSettingsRepository";
import { CreateStock } from "../../application/use-cases/CreateStock";
import { UpdateStock } from "../../application/use-cases/UpdateStock";
import { DeleteStock } from "../../application/use-cases/DeleteStock";
import { ListAllStocks } from "../../application/use-cases/ListAllStocks";

export class DirectorController {
  constructor(
    private listAllClients: ListAllClients,
    private banClient: BanClient,
    private unbanClient: UnbanClient,
    private updateClientInfo: UpdateClientInfo,
    private deleteClient: DeleteClient,
    private createClientByDirector: CreateClientByDirector,
    private setSavingsRate: SetSavingsRate,
    private bankSettingsRepo: BankSettingsRepository,
    private createStockUseCase: CreateStock,
    private updateStockUseCase: UpdateStock,
    private deleteStockUseCase: DeleteStock,
    private listAllStocks: ListAllStocks
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

  // === Gestion des Actions ===
  createStock = async (req: Request, res: Response) => {
    try {
      const { symbol, name, initialPrice } = req.body;
      if (!symbol || !name) {
        return res.status(400).json({ message: "Le symbole et le nom sont requis" });
      }
      const stock = await this.createStockUseCase.execute(symbol, name, initialPrice || 0);
      res.status(201).json({ 
        message: "Action créée avec succès",
        stock: {
          id: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          currentPrice: stock.currentPrice,
          isAvailable: stock.isAvailable,
          createdAt: stock.createdAt
        }
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  listStocks = async (_req: Request, res: Response) => {
    try {
      const stocks = await this.listAllStocks.execute();
      res.status(200).json({ 
        stocks: stocks.map(s => ({
          id: s.id,
          symbol: s.symbol,
          name: s.name,
          currentPrice: s.currentPrice,
          isAvailable: s.isAvailable,
          createdAt: s.createdAt
        }))
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  updateStock = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { symbol, name, isAvailable } = req.body;
      await this.updateStockUseCase.execute(id, { symbol, name, isAvailable });
      res.status(200).json({ message: "Action modifiée avec succès" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  removeStock = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.deleteStockUseCase.execute(id);
      res.status(200).json({ message: "Action supprimée avec succès" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}

