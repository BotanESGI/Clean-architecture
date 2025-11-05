import bcrypt from "bcryptjs";
import { DataSource } from "typeorm";
import { ClientEntity } from "../adapters/mysql/entities/ClientEntity";

export async function seedDirector(dataSource: DataSource) {
  const clientRepo = dataSource.getRepository(ClientEntity);

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
    } else {
      console.log("✅ Le directeur existe déjà");
    }
    return;
  }

  // Créer le directeur
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  
  const director = new ClientEntity();
  director.id = "director-001";
  director.firstName = "Admin";
  director.lastName = "Directeur";
  director.email = "director@banque.com";
  director.passwordHashed = passwordHash;
  director.isVerified = true;
  director.role = "DIRECTOR";
  director.isBanned = false;
  director.accountIds = [];

  await clientRepo.save(director);
  
  console.log("✅ Directeur créé avec succès !");
  console.log("📧 Email: director@banque.com");
  console.log("🔑 Mot de passe: Admin123!");
}

