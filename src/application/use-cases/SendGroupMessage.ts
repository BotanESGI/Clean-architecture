import { GroupMessage } from "../../domain/entities/GroupMessage";
import { GroupMessageRepository } from "../repositories/GroupMessageRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import crypto from "crypto";

export class SendGroupMessage {
  constructor(
    private readonly messageRepo: GroupMessageRepository,
    private readonly clientRepo: ClientRepository
  ) {}

  async execute(senderId: string, content: string): Promise<GroupMessage> {
    // Vérifier que le sender existe
    const sender = await this.clientRepo.findById(senderId);
    if (!sender) {
      throw new Error("Expéditeur introuvable");
    }

    // Vérifier que le sender est un conseiller ou un directeur
    const senderRole = sender.getRole();
    if (senderRole !== "ADVISOR" && senderRole !== "DIRECTOR") {
      throw new Error("Seuls les conseillers et directeurs peuvent envoyer des messages de groupe");
    }

    // Valider le contenu
    if (!content || content.trim().length === 0) {
      throw new Error("Le message ne peut pas être vide");
    }

    if (content.length > 1000) {
      throw new Error("Le message ne peut pas dépasser 1000 caractères");
    }

    const senderName = `${sender.getFirstName()} ${sender.getLastName()}`;

    const message = new GroupMessage(
      crypto.randomUUID(),
      senderId,
      senderRole,
      senderName,
      content.trim(),
      new Date()
    );

    await this.messageRepo.save(message);
    return message;
  }
}
