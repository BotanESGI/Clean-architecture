-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
                                       id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_verification_token (verification_token)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des comptes
CREATE TABLE IF NOT EXISTS accounts (
                                        id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) NOT NULL,
    iban VARCHAR(34) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    custom_name VARCHAR(100),
    account_type ENUM('checking', 'savings') DEFAULT 'checking',
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_id (client_id),
    INDEX idx_iban (iban)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: Ajouter la colonne account_type si elle n'existe pas
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS account_type ENUM('checking', 'savings') DEFAULT 'checking';

-- Migration: Ajouter la colonne is_closed si elle n'existe pas
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT FALSE;

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
                                            id VARCHAR(36) PRIMARY KEY,
    from_account_id VARCHAR(36),
    to_account_id VARCHAR(36),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type ENUM('DEBIT', 'CREDIT', 'TRANSFER') NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    INDEX idx_from_account (from_account_id),
    INDEX idx_to_account (to_account_id),
    INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des paramètres de la banque
CREATE TABLE IF NOT EXISTS bank_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT 'default',
    savings_rate DECIMAL(5, 4) DEFAULT 0.01 COMMENT 'Taux d''épargne en décimal (ex: 0.01 = 1%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer les paramètres par défaut
INSERT IGNORE INTO bank_settings (id, savings_rate) VALUES ('default', 0.01);