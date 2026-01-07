import bcrypt from "bcryptjs";
import { DataSource } from "typeorm";
import { ClientEntity } from "../adapters/mysql/entities/ClientEntity";

export async function seedAdvisor(dataSource: DataSource) {
  const clientRepo = dataSource.getRepository(ClientEntity);

  // Premier conseiller
  const existingAdvisor1 = await clientRepo.findOne({
    where: { email: "advisor@banque.com" },
  });

  if (existingAdvisor1) {
    if (existingAdvisor1.role !== "ADVISOR") {
      existingAdvisor1.role = "ADVISOR";
      existingAdvisor1.isVerified = true;
      await clientRepo.save(existingAdvisor1);
      console.log("Le conseiller a été mis à jour avec le role ADVISOR");
    } else {
      console.log("Le conseiller existe déjà");
    }
  } else {
    const passwordHash1 = await bcrypt.hash("Advisor123!", 10);
    
    const advisor1 = new ClientEntity();
    advisor1.id = "advisor-001";
    advisor1.firstName = "Conseiller";
    advisor1.lastName = "Bancaire";
    advisor1.email = "advisor@banque.com";
    advisor1.passwordHashed = passwordHash1;
    advisor1.isVerified = true;
    advisor1.role = "ADVISOR";
    advisor1.isBanned = false;

    await clientRepo.save(advisor1);
    
    console.log("Conseiller créé avec succès !");
    console.log("Email: advisor@banque.com");
    console.log("Mot de passe: Advisor123!");
  }

  // Deuxième conseiller
  const existingAdvisor2 = await clientRepo.findOne({
    where: { email: "advisor2@banque.com" },
  });

  if (existingAdvisor2) {
    if (existingAdvisor2.role !== "ADVISOR") {
      existingAdvisor2.role = "ADVISOR";
      existingAdvisor2.isVerified = true;
      await clientRepo.save(existingAdvisor2);
      console.log("Le deuxième conseiller a été mis à jour avec le role ADVISOR");
    } else {
      console.log("Le deuxième conseiller existe déjà");
    }
  } else {
    const passwordHash2 = await bcrypt.hash("Advisor2123!", 10);
    
    const advisor2 = new ClientEntity();
    advisor2.id = "advisor-002";
    advisor2.firstName = "Sophie";
    advisor2.lastName = "Martin";
    advisor2.email = "advisor2@banque.com";
    advisor2.passwordHashed = passwordHash2;
    advisor2.isVerified = true;
    advisor2.role = "ADVISOR";
    advisor2.isBanned = false;

    await clientRepo.save(advisor2);
    
    console.log("Deuxième conseiller créé avec succès !");
    console.log("Email: advisor2@banque.com");
    console.log("Mot de passe: Advisor2123!");
  }
}

