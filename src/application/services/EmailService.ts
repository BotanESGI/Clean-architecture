export interface EmailService {
    /**
     * Envoie un email de confirmation au client nouvellement inscrit.
     * @param to Adresse email du destinataire
     * @param clientId Identifiant du client, utilisé pour le lien de confirmation
     */
    sendConfirmationEmail(to: string, clientId: string): Promise<void>;
  }
  