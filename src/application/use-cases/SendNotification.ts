import { ClientRepository } from "../repositories/ClientRepository";

export class SendNotification {
  constructor(
    private readonly clientRepo: ClientRepository,
    private readonly onNotificationSent: (clientId: string, title: string, message: string) => void
  ) {}

  async execute(
    senderId: string,
    receiverId: string,
    title: string,
    message: string
  ): Promise<void> {
    // Vérifier que le sender est un conseiller
    const sender = await this.clientRepo.findById(senderId);
    if (!sender) {
      throw new Error("Expéditeur introuvable");
    }

    if (sender.getRole() !== "ADVISOR" && sender.getRole() !== "DIRECTOR") {
      throw new Error("Seuls les conseillers et directeurs peuvent envoyer des notifications");
    }

    // Vérifier que le receiver existe
    const receiver = await this.clientRepo.findById(receiverId);
    if (!receiver) {
      throw new Error("Destinataire introuvable");
    }

    // Valider les données
    if (!title || title.trim().length === 0) {
      throw new Error("Le titre ne peut pas être vide");
    }

    if (!message || message.trim().length === 0) {
      throw new Error("Le message ne peut pas être vide");
    }

    // Notifier via le callback (qui sera connecté au WebSocket)
    this.onNotificationSent(receiverId, title.trim(), message.trim());
  }
}


