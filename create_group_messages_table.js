// Script Node.js pour créer la table group_messages
// Utilise les mêmes identifiants que l'application

require('dotenv').config();
const mysql = require('mysql2/promise');

// Essayer plusieurs configurations
const configs = [
  // Configuration depuis .env
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'clean_architecture_db',
  },
  // Configuration Docker par défaut
  {
    host: 'cleanarch-mysql',
    port: 3306,
    user: 'app_user',
    password: 'app_password',
    database: 'clean_architecture_db',
  },
  // Configuration locale par défaut
  {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'clean_architecture_db',
  },
];

async function createTable() {
  let connection;
  let lastError;
  
  // Essayer chaque configuration jusqu'à ce qu'une fonctionne
  for (const config of configs) {
    try {
      console.log(`🔌 Tentative de connexion à MySQL (${config.host}:${config.port})...`);
      connection = await mysql.createConnection(config);
      console.log('✅ Connecté à MySQL');
      break;
    } catch (error) {
      lastError = error;
      console.log(`❌ Échec: ${error.message}`);
      continue;
    }
  }
  
  if (!connection) {
    console.error('❌ Impossible de se connecter à MySQL avec aucune des configurations');
    console.error('💡 Vérifiez vos identifiants MySQL dans le fichier .env');
    process.exit(1);
  }
  
  try {

    const sql = `
      CREATE TABLE IF NOT EXISTS group_messages (
        id VARCHAR(36) PRIMARY KEY,
        sender_id VARCHAR(36) NOT NULL,
        sender_role VARCHAR(50) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sender (sender_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (sender_id) REFERENCES clients(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('📝 Création de la table group_messages...');
    await connection.execute(sql);
    console.log('✅ Table group_messages créée avec succès!');
    
    // Vérifier que la table existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'group_messages'");
    if (tables.length > 0) {
      console.log('✅ Vérification: La table group_messages existe bien');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTable();
