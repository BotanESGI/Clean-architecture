"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSavingsRate = void 0;
class SetSavingsRate {
    constructor(bankSettingsRepo, accountRepo, clientRepo, emailService) {
        this.bankSettingsRepo = bankSettingsRepo;
        this.accountRepo = accountRepo;
        this.clientRepo = clientRepo;
        this.emailService = emailService;
    }
    async execute(rate) {
        if (rate < 0 || rate > 1) {
            throw new Error("Le taux doit être entre 0 et 1 (0% à 100%)");
        }
        // Mettre à jour le taux
        await this.bankSettingsRepo.setSavingsRate(rate);
        // Notifier tous les clients ayant un compte d'épargne
        const allAccounts = await this.accountRepo.listAll();
        const savingsAccounts = allAccounts.filter(acc => acc.accountType === "savings" && !acc.isClosed);
        // Récupérer les clients uniques
        const clientIds = [...new Set(savingsAccounts.map(acc => acc.clientId))];
        // Envoyer une notification à chaque client
        for (const clientId of clientIds) {
            const client = await this.clientRepo.findById(clientId);
            if (client) {
                const clientEmail = client.getEmail();
                if (clientEmail) {
                    await this.emailService.sendSavingsRateChangeNotification(clientEmail, rate * 100 // Convertir en pourcentage pour l'affichage
                    );
                }
            }
        }
    }
}
exports.SetSavingsRate = SetSavingsRate;
