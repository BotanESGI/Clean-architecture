import { BankSettingsRepository } from "../repositories/BankSettingsRepository";
import { AccountRepository } from "../repositories/AccountRepository";
import { EmailService } from "../services/EmailService";
import { ClientRepository } from "../repositories/ClientRepository";

export class SetSavingsRate {
  constructor(
    private bankSettingsRepo: BankSettingsRepository,
    private accountRepo: AccountRepository,
    private clientRepo: ClientRepository,
    private emailService: EmailService
  ) {}

  async execute(rate: number) {
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
          await this.emailService.sendSavingsRateChangeNotification(
            clientEmail,
            rate * 100 // Convertir en pourcentage pour l'affichage
          );
        }
      }
    }
  }
}

