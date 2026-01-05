-- Migration pour ajouter la table private_messages
-- À exécuter si la base de données existe déjà

USE clean_architecture_db;

-- Table des messages privés (discussions entre clients et conseillers)
CREATE TABLE IF NOT EXISTS private_messages (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id),
    FOREIGN KEY (sender_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

