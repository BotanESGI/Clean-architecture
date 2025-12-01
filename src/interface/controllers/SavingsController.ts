import { Request, Response } from "express";
import { BankSettingsRepository } from "../../application/repositories/BankSettingsRepository";

export class SavingsController {
  constructor(private bankSettingsRepo: BankSettingsRepository) {}

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
}

