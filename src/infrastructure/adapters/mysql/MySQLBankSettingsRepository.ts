import { DataSource, Repository } from "typeorm";
import { BankSettingsRepository } from "../../../application/repositories/BankSettingsRepository";
import { BankSettingsEntity } from "./entities/BankSettingsEntity";

export class MySQLBankSettingsRepository implements BankSettingsRepository {
  private repo: Repository<BankSettingsEntity>;

  constructor(private dataSource: DataSource) {
    this.repo = dataSource.getRepository(BankSettingsEntity);
  }

  async getSavingsRate(): Promise<number> {
    let settings = await this.repo.findOne({ where: { id: "default" } });
    
    if (!settings) {
      // Créer les paramètres par défaut si ils n'existent pas
      settings = new BankSettingsEntity();
      settings.id = "default";
      settings.savingsRate = 0.01; // 1% par défaut
      await this.repo.save(settings);
    }
    
    return Number(settings.savingsRate);
  }

  async setSavingsRate(rate: number): Promise<void> {
    if (rate < 0 || rate > 1) {
      throw new Error("Le taux doit être entre 0 et 1 (0% à 100%)");
    }

    let settings = await this.repo.findOne({ where: { id: "default" } });
    
    if (!settings) {
      settings = new BankSettingsEntity();
      settings.id = "default";
    }
    
    settings.savingsRate = rate;
    await this.repo.save(settings);
  }
}

