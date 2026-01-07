"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdvisor = seedAdvisor;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ClientEntity_1 = require("../adapters/mysql/entities/ClientEntity");
async function seedAdvisor(dataSource) {
    const clientRepo = dataSource.getRepository(ClientEntity_1.ClientEntity);
    const existingAdvisor = await clientRepo.findOne({
        where: { email: "advisor@banque.com" },
    });
    if (existingAdvisor) {
        if (existingAdvisor.role !== "ADVISOR") {
            existingAdvisor.role = "ADVISOR";
            existingAdvisor.isVerified = true;
            await clientRepo.save(existingAdvisor);
            console.log("✅ Le conseiller a été mis à jour avec le role ADVISOR");
        }
        else {
            console.log("✅ Le conseiller existe déjà");
        }
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash("Advisor123!", 10);
    const advisor = new ClientEntity_1.ClientEntity();
    advisor.id = "advisor-001";
    advisor.firstName = "Conseiller";
    advisor.lastName = "Bancaire";
    advisor.email = "advisor@banque.com";
    advisor.passwordHashed = passwordHash;
    advisor.isVerified = true;
    advisor.role = "ADVISOR";
    advisor.isBanned = false;
    await clientRepo.save(advisor);
    console.log("✅ Conseiller créé avec succès !");
    console.log("📧 Email: advisor@banque.com");
    console.log("🔑 Mot de passe: Advisor123!");
}
