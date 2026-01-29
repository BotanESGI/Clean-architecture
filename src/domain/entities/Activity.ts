/**
 * Entité métier : actualité de la banque (créée par un conseiller, consultable par les clients).
 */
export class Activity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly authorId: string,
    public readonly createdAt: Date = new Date(),
    public readonly isPublished: boolean = true
  ) {}

  static validateTitle(title: string): boolean {
    return typeof title === "string" && title.trim().length >= 1 && title.length <= 200;
  }

  static validateContent(content: string): boolean {
    return typeof content === "string" && content.trim().length >= 1 && content.length <= 5000;
  }
}
