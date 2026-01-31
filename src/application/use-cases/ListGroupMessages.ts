import { GroupMessage } from "../../domain/entities/GroupMessage";
import { GroupMessageRepository } from "../repositories/GroupMessageRepository";

export class ListGroupMessages {
  constructor(
    private readonly messageRepo: GroupMessageRepository
  ) {}

  async execute(limit?: number): Promise<GroupMessage[]> {
    const messages = limit 
      ? await this.messageRepo.findRecent(limit)
      : await this.messageRepo.findAll();
    
    // Trier par date de création (plus ancien en premier)
    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
