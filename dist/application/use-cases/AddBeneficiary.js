"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBeneficiary = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Beneficiary_1 = require("../../domain/entities/Beneficiary");
class AddBeneficiary {
    constructor(beneficiaryRepo, verifyBeneficiary) {
        this.beneficiaryRepo = beneficiaryRepo;
        this.verifyBeneficiary = verifyBeneficiary;
    }
    async execute(params) {
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
                actualFirstName: verification.firstName,
                actualLastName: verification.lastName,
                accountName: verification.accountName || "Compte courant",
            };
        }
        // Créer le bénéficiaire (utiliser les vrais noms du compte)
        const beneficiary = new Beneficiary_1.Beneficiary(crypto_1.default.randomUUID(), ownerClientId, iban, verification.firstName, verification.lastName, verification.accountName || "Compte courant");
        await this.beneficiaryRepo.create(beneficiary);
        return beneficiary;
    }
}
exports.AddBeneficiary = AddBeneficiary;
