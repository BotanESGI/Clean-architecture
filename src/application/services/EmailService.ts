export interface EmailService {
    /**
     * Envoie un email de confirmation au client nouvellement inscrit.
     * @param to Adresse email du destinataire
     * @param clientId Identifiant du client, utilisé pour le lien de confirmation
     */
    sendConfirmationEmail(to: string, clientId: string): Promise<void>;
    
    /**
     * Envoie une notification aux clients concernant le changement du taux d'épargne.
     * @param to Adresse email du destinataire
     * @param rate Nouveau taux d'épargne en pourcentage
     */
    sendSavingsRateChangeNotification(to: string, rate: number): Promise<void>;
  }
  