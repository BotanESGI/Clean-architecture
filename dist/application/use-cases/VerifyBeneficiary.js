"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyBeneficiary = void 0;
class VerifyBeneficiary {
    constructor(accountRepo, clientRepo) {
        this.accountRepo = accountRepo;
        this.clientRepo = clientRepo;
    }
    async execute(iban, expectedFirstName, expectedLastName) {
        const account = await this.accountRepo.findByIban(iban);
        if (!account) {
            return { exists: false, message: "RIB introuvable" };
        }
        const client = await this.clientRepo.findById(account.clientId);
        if (!client) {
            return { exists: false, message: "Client introuvable" };
        }
        const actualFirstName = client.getFirstName();
        const actualLastName = client.getLastName();
        // Si les noms sont fournis, vérifier la correspondance
        if (expectedFirstName && expectedLastName) {
            const firstNameMatch = actualFirstName.toLowerCase() === expectedFirstName.toLowerCase();
            const lastNameMatch = actualLastName.toLowerCase() === expectedLastName.toLowerCase();
            if (firstNameMatch && lastNameMatch) {
                return {
                    exists: true,
                    verified: true,
                    firstName: actualFirstName,
                    lastName: actualLastName,
                    accountName: account.name,
                };
            }
            else {
                return {
                    exists: true,
                    verified: false,
                    firstName: actualFirstName,
                    lastName: actualLastName,
                    accountName: account.name,
                    message: `Le RIB existe mais le bénéficiaire est : ${actualFirstName} ${actualLastName}`,
                };
            }
        }
        // Si pas de nom fourni, retourner juste l'info
        return {
            exists: true,
            verified: true,
            firstName: actualFirstName,
            lastName: actualLastName,
            accountName: account.name,
        };
    }
}
exports.VerifyBeneficiary = VerifyBeneficiary;
