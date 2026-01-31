import { AppDataSource } from "../adapters/mysql/database";
import { GroupMessageEntity } from "../adapters/mysql/entities/GroupMessageEntity";

async function createGroupMessagesTable() {
  try {
    console.log("🔌 Connexion à la base de données...");
    await AppDataSource.initialize();
    console.log("✅ Connecté à la base de données");

    console.log("📝 Création de la table group_messages...");
    const queryRunner = AppDataSource.createQueryRunner();
    
    await queryRunner.createTable(
      queryRunner.manager.connection.getMetadata(GroupMessageEntity).tableMetadataArgs,
      true // skipIfExists
    );
    
    console.log("✅ Table group_messages créée avec succès!");
    
    // Vérifier que la table existe
    const result = await queryRunner.query("SHOW TABLES LIKE 'group_messages'");
    if (result.length > 0) {
      console.log("✅ Vérification: La table group_messages existe bien");
    }
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error("❌ Erreur:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

createGroupMessagesTable();
