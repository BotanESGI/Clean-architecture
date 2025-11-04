import crypto from "crypto";
import { BeneficiaryRepository } from "../repositories/BeneficiaryRepository";
import { Beneficiary } from "../../domain/entities/Beneficiary";
import { AccountRepository } from "../repositories/AccountRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { VerifyBeneficiary } from "./VerifyBeneficiary";

export class AddBeneficiary {
  constructor(
    private beneficiaryRepo: BeneficiaryRepository,
    private verifyBeneficiary: VerifyBeneficiary
  ) {}

  async execute(params: {
    ownerClientId: string;
    iban: string;
    firstName: string;
    lastName: string;
    forceWithMismatch?: boolean; // Si true, on accepte même si les noms ne correspondent pas
  }): Promise<Beneficiary> {
    const { ownerClientId, iban, firstName, lastName, forceWithMismatch } = params;

    // Vérifier si le bénéficiaire existe déjà pour ce client
    const existing = await this.beneficiaryRepo.findByIbanAndOwner(iban, ownerClientId);
    if (existing) {
      throw new Error("Ce bénéficiaire existe déjà dans votre liste");
    }

    // Vérifier le RIB et les noms
    const verification = await this.verifyBeneficiary.execute(iban, firstName, lastName);

    if (!verification.exists) {
      throw new Error("RIB introuvable. Le bénéficiaire doit être client de Banque AVENIR.");
    }

    if (!verification.verified && !forceWithMismatch) {
      // Le RIB existe mais les noms ne correspondent pas - on retourne une erreur spéciale
      return {
        needsConfirmation: true,
        message: `Le RIB existe mais le bénéficiaire est : ${verification.firstName} ${verification.lastName}`,
        actualFirstName: verification.firstName!,
        actualLastName: verification.lastName!,
        accountName: verification.accountName || "Compte courant",
      } as any;
    }

    // Créer le bénéficiaire (utiliser les vrais noms du compte)
    const beneficiary = new Beneficiary(
      crypto.randomUUID(),
      ownerClientId,
      iban,
      verification.firstName!,
      verification.lastName!,
      verification.accountName || "Compte courant"
    );

    await this.beneficiaryRepo.create(beneficiary);
    return beneficiary;
  }
}

