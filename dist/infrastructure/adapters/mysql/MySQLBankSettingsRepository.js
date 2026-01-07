"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLBankSettingsRepository = void 0;
const BankSettingsEntity_1 = require("./entities/BankSettingsEntity");
class MySQLBankSettingsRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repo = dataSource.getRepository(BankSettingsEntity_1.BankSettingsEntity);
    }
    async getSavingsRate() {
        let settings = await this.repo.findOne({ where: { id: "default" } });
        if (!settings) {
            // Créer les paramètres par défaut si ils n'existent pas
            settings = new BankSettingsEntity_1.BankSettingsEntity();
            settings.id = "default";
            settings.savingsRate = 0.01; // 1% par défaut
            await this.repo.save(settings);
        }
        return Number(settings.savingsRate);
    }
    async setSavingsRate(rate) {
        if (rate < 0 || rate > 1) {
            throw new Error("Le taux doit être entre 0 et 1 (0% à 100%)");
        }
        let settings = await this.repo.findOne({ where: { id: "default" } });
        if (!settings) {
            settings = new BankSettingsEntity_1.BankSettingsEntity();
            settings.id = "default";
        }
        settings.savingsRate = rate;
        await this.repo.save(settings);
    }
}
exports.MySQLBankSettingsRepository = MySQLBankSettingsRepository;
