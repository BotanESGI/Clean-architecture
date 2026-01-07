"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavingsController = void 0;
class SavingsController {
    constructor(bankSettingsRepo) {
        this.bankSettingsRepo = bankSettingsRepo;
        this.getSavingsRate = async (_req, res) => {
            try {
                const rate = await this.bankSettingsRepo.getSavingsRate();
                res.status(200).json({
                    rate: rate * 100 // Retourner en pourcentage
                });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        };
    }
}
exports.SavingsController = SavingsController;
