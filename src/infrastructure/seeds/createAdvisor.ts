import bcrypt from "bcryptjs";
import { DataSource } from "typeorm";
import { ClientEntity } from "../adapters/mysql/entities/ClientEntity";

export async function seedAdvisor(dataSource: DataSource) {
  const clientRepo = dataSource.getRepository(ClientEntity);

  const existingAdvisor = await clientRepo.findOne({
    where: { email: "advisor@banque.com" },
  });

  if (existingAdvisor) {
    if (existingAdvisor.role !== "ADVISOR") {
      existingAdvisor.role = "ADVISOR";
      existingAdvisor.isVerified = true;
      await clientRepo.save(existingAdvisor);
      console.log("✅ Le conseiller a été mis à jour avec le role ADVISOR");
    } else {
      console.log("✅ Le conseiller existe déjà");
    }
    return;
  }

  const passwordHash = await bcrypt.hash("Advisor123!", 10);
  
  const advisor = new ClientEntity();
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

