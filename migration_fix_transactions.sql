-- Script de migration pour corriger le schéma de la table transactions
-- À exécuter manuellement dans MySQL si la table existe déjà avec l'ancien schéma

USE clean_architecture_db;

-- Note: Si des contraintes de clé étrangère existent, elles seront automatiquement supprimées
-- lors de la suppression de la table. Pas besoin de les supprimer manuellement.

-- Supprimer l'ancienne table transactions si elle existe
DROP TABLE IF EXISTS transactions;

-- Recréer la table transactions avec le bon schéma
CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    accountId VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    label VARCHAR(255) NOT NULL,
    relatedAccountId VARCHAR(36),
    relatedClientName VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE,
    INDEX idx_accountId (accountId),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

