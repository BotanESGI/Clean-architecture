-- Migration pour ajouter la table notifications
-- À exécuter si la base de données existe déjà

USE clean_architecture_db;

-- Table des notifications (notifications envoyées aux clients par les conseillers)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    receiver_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_receiver (receiver_id),
    INDEX idx_sender (sender_id),
    INDEX idx_receiver_read (receiver_id, is_read),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (receiver_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
