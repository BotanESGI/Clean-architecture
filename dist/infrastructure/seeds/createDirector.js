"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDirector = seedDirector;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ClientEntity_1 = require("../adapters/mysql/entities/ClientEntity");
async function seedDirector(dataSource) {
    const clientRepo = dataSource.getRepository(ClientEntity_1.ClientEntity);
    // Vérifier si le directeur existe déjà
    const existingDirector = await clientRepo.findOne({
        where: { email: "director@banque.com" },
    });
    if (existingDirector) {
        // Mettre à jour le role si ce n'est pas DIRECTOR
        if (existingDirector.role !== "DIRECTOR") {
            existingDirector.role = "DIRECTOR";
            existingDirector.isVerified = true;
            await clientRepo.save(existingDirector);
            console.log("✅ Le directeur a été mis à jour avec le role DIRECTOR");
        }
        else {
            console.log("✅ Le directeur existe déjà");
        }
        return;
    }
    // Créer le directeur
    const passwordHash = await bcryptjs_1.default.hash("Admin123!", 10);
    const director = new ClientEntity_1.ClientEntity();
    director.id = "director-001";
    director.firstName = "Admin";
    director.lastName = "Directeur";
    director.email = "director@banque.com";
    director.passwordHashed = passwordHash;
    director.isVerified = true;
    director.role = "DIRECTOR";
    director.isBanned = false;
    await clientRepo.save(director);
    console.log("✅ Directeur créé avec succès !");
    console.log("📧 Email: director@banque.com");
    console.log("🔑 Mot de passe: Admin123!");
}
