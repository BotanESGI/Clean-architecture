# Instructions pour créer la table group_messages

## Problème
La table `group_messages` n'existe pas dans la base de données, ce qui empêche la discussion de groupe de fonctionner.

## Solution

### Option 1 : Via MySQL directement

Connectez-vous à MySQL et exécutez :

```sql
USE clean_architecture_db;

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
```

### Option 2 : Via Docker

Si vous utilisez Docker, exécutez :

```bash
docker exec -i cleanarch-mysql mysql -u root -p clean_architecture_db < migration_group_messages.sql
```

(Remplacez le mot de passe si nécessaire)

### Option 3 : Via Adminer (interface web)

1. Ouvrez http://localhost:8080 dans votre navigateur
2. Connectez-vous avec vos identifiants MySQL
3. Sélectionnez la base de données `clean_architecture_db`
4. Allez dans l'onglet SQL
5. Copiez-collez le contenu de `migration_group_messages.sql`
6. Cliquez sur "Exécuter"

### Option 4 : Via le script Node.js

```bash
node create_group_messages_table.js
```

(Assurez-vous que vos identifiants MySQL sont corrects dans le fichier .env)

## Vérification

Après avoir créé la table, vérifiez qu'elle existe :

```sql
SHOW TABLES LIKE 'group_messages';
```

Vous devriez voir la table listée.

## Redémarrage

Après avoir créé la table, **redémarrez le serveur Node.js** pour que les changements prennent effet.
