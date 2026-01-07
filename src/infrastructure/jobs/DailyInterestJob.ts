import { CalculateDailyInterest } from "../../application/use-cases/CalculateDailyInterest";

export class DailyInterestJob {
  private intervalId: NodeJS.Timeout | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private calculateDailyInterest: CalculateDailyInterest) {}

  /**
   * Calcule le temps en millisecondes jusqu'à minuit
   */
  private getMillisecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Minuit du jour suivant
    return midnight.getTime() - now.getTime();
  }

  /**
   * Démarre le job qui calcule les intérêts quotidiens
   * Exécute tous les jours à minuit précisément
   */
  start(): void {
    if (this.intervalId || this.timeoutId) {
      console.log("Le job d'intérêts quotidiens est déjà en cours d'exécution");
      return;
    }

    console.log("Démarrage du job de calcul des intérêts quotidiens");
    
    // Fonction pour programmer la prochaine exécution à minuit
    const scheduleNextExecution = () => {
      const msUntilMidnight = this.getMillisecondsUntilMidnight();
      console.log(`Prochaine exécution programmée dans ${Math.round(msUntilMidnight / 1000 / 60)} minutes (à minuit)`);
      
      this.timeoutId = setTimeout(() => {
        this.execute();
        // Après la première exécution à minuit, programmer toutes les 24h
        this.intervalId = setInterval(() => {
          this.execute();
        }, 24 * 60 * 60 * 1000);
      }, msUntilMidnight);
    };

    // Programmer la première exécution à minuit
    scheduleNextExecution();
  }

  /**
   * Arrête le job
   */
  stop(): void {
    let stopped = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      stopped = true;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      stopped = true;
    }
    if (stopped) {
      console.log("Arrêt du job de calcul des intérêts quotidiens");
    }
  }

  /**
   * Exécute le calcul des intérêts (peut être appelé manuellement)
   */
  async execute(): Promise<void> {
    if (this.isRunning) {
      console.log("Le calcul des intérêts est déjà en cours...");
      return;
    }

    this.isRunning = true;
    try {
      console.log("Début du calcul des intérêts quotidiens...");
      const result = await this.calculateDailyInterest.execute();
      console.log(
        `Calcul des intérêts terminé: ${result.accountsProcessed} comptes traités, ` +
        `${result.totalInterest.toFixed(2)}€ d'intérêts distribués`
      );
    } catch (error) {
      console.error("Erreur lors du calcul des intérêts:", error);
    } finally {
      this.isRunning = false;
    }
  }
}

