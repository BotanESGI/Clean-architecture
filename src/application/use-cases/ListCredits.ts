import { CreditRepository } from "../repositories/CreditRepository";
import { Credit } from "../../domain/entities/Credit";

export class ListCredits {
  constructor(private readonly creditRepository: CreditRepository) {}

  async execute(filters?: {
    clientId?: string;
    advisorId?: string;
    status?: "pending" | "active" | "completed" | "cancelled";
  }): Promise<Credit[]> {
    if (filters?.clientId) {
      return await this.creditRepository.findByClientId(filters.clientId);
    }
    if (filters?.advisorId) {
      return await this.creditRepository.findByAdvisorId(filters.advisorId);
    }
    const allCredits = await this.creditRepository.listAll();
    if (filters?.status) {
      return allCredits.filter((credit) => credit.status === filters.status);
    }
    return allCredits;
  }
}

