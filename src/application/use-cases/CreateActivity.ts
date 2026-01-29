import crypto from "crypto";
import { Activity } from "../../domain/entities/Activity";
import { ActivityRepository } from "../repositories/ActivityRepository";
import { ClientRepository } from "../repositories/ClientRepository";

export class CreateActivity {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly clientRepository: ClientRepository
  ) {}

  async execute(authorId: string, title: string, content: string): Promise<Activity> {
    const author = await this.clientRepository.findById(authorId);
    if (!author) {
      throw new Error("Auteur introuvable");
    }
    const role = author.getRole();
    if (role !== "ADVISOR" && role !== "DIRECTOR") {
      throw new Error("Seuls les conseillers et directeurs peuvent créer une actualité");
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!Activity.validateTitle(trimmedTitle)) {
      throw new Error("Le titre doit contenir entre 1 et 200 caractères");
    }
    if (!Activity.validateContent(trimmedContent)) {
      throw new Error("Le contenu doit contenir entre 1 et 5000 caractères");
    }

    const activity = new Activity(
      crypto.randomUUID(),
      trimmedTitle,
      trimmedContent,
      authorId,
      new Date(),
      true
    );

    await this.activityRepository.save(activity);
    return activity;
  }
}
