import { Credit } from "../../domain/entities/Credit";

export interface CreditRepository {
  create(credit: Credit): Promise<void>;
  findById(id: string): Promise<Credit | null>;
  findByClientId(clientId: string): Promise<Credit[]>;
  findByAdvisorId(advisorId: string): Promise<Credit[]>;
  update(credit: Credit): Promise<void>;
  listAll(): Promise<Credit[]>;
}

