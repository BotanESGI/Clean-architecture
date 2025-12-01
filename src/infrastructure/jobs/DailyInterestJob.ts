import { CalculateDailyInterest } from "../../application/use-cases/CalculateDailyInterest";

export class DailyInterestJob {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private calculateDailyInterest: CalculateDailyInterest) {}

  /**
   * Démarre le job qui calcule les intérêts quotidiens
   * Par défaut, exécute tous les jours à minuit
   */
  start(intervalMs: number = 24 * 60 * 60 * 1000): void {
    if (this.intervalId) {
      console.log("⚠️ Le job d'intérêts quotidiens est déjà en cours d'exécution");
      return;
    }

    console.log("🔄 Démarrage du job de calcul des intérêts quotidiens");
    
    // Exécuter immédiatement au démarrage (pour les tests)
    this.execute();

    // Puis exécuter selon l'intervalle
    this.intervalId = setInterval(() => {
      this.execute();
    }, intervalMs);
  }

  /**
   * Arrête le job
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("⏹️ Arrêt du job de calcul des intérêts quotidiens");
    }
  }

  /**
   * Exécute le calcul des intérêts (peut être appelé manuellement)
   */
  async execute(): Promise<void> {
    if (this.isRunning) {
      console.log("⏳ Le calcul des intérêts est déjà en cours...");
      return;
    }

    this.isRunning = true;
    try {
      console.log("💰 Début du calcul des intérêts quotidiens...");
      const result = await this.calculateDailyInterest.execute();
      console.log(
        `✅ Calcul des intérêts terminé: ${result.accountsProcessed} comptes traités, ` +
        `${result.totalInterest.toFixed(2)}€ d'intérêts distribués`
      );
    } catch (error) {
      console.error("❌ Erreur lors du calcul des intérêts:", error);
    } finally {
      this.isRunning = false;
    }
  }
}

