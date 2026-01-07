-- Migration pour ajouter la table conversations
-- Cette table associe un client à un conseiller assigné pour les discussions privées
-- Si assigned_advisor_id est NULL, la conversation est en attente et visible par tous les conseillers

USE clean_architecture_db;

-- Table des conversations (associe un client à un conseiller assigné)
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) NOT NULL UNIQUE,
    assigned_advisor_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client (client_id),
    INDEX idx_advisor (assigned_advisor_id),
    INDEX idx_pending (assigned_advisor_id, created_at),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_advisor_id) REFERENCES clients(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

