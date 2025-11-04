import { Beneficiary } from "../../domain/entities/Beneficiary";

export interface BeneficiaryRepository {
  create(beneficiary: Beneficiary): Promise<void>;
  findByOwnerId(ownerClientId: string): Promise<Beneficiary[]>;
  findByIbanAndOwner(iban: string, ownerClientId: string): Promise<Beneficiary | null>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Beneficiary | null>;
}

