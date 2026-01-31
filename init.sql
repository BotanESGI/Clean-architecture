-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    role VARCHAR(50) DEFAULT 'CLIENT',
    is_banned BOOLEAN DEFAULT FALSE,
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
    balance DECIMAL(10, 2) DEFAULT 0.00,
    custom_name VARCHAR(100),
    account_type ENUM('checking', 'savings') DEFAULT 'checking',
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client_id (client_id),
    INDEX idx_iban (iban)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: Supprimer l'ancienne table transactions si elle existe avec l'ancien schéma
DROP TABLE IF EXISTS transactions;

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
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

-- Table des paramètres de la banque
CREATE TABLE IF NOT EXISTS bank_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT 'default',
    savings_rate DECIMAL(5, 4) DEFAULT 0.01 COMMENT 'Taux d''épargne en décimal (ex: 0.01 = 1%)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer les paramètres par défaut
INSERT IGNORE INTO bank_settings (id, savings_rate) VALUES ('default', 0.01);

-- Table des actions (stocks)
CREATE TABLE IF NOT EXISTS stocks (
    id VARCHAR(36) PRIMARY KEY,
    symbol VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    current_price DECIMAL(10, 2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_symbol (symbol),
    INDEX idx_is_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Table des messages de groupe (discussions entre conseillers et directeurs)
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

-- Table des conversations (associe un client à un conseiller assigné pour les discussions privées)
-- Si assigned_advisor_id est NULL, la conversation est en attente et visible par tous les conseillers
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

-- Table des ordres d'investissement (achat/vente d'actions)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    stock_id VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL COMMENT 'BUY ou SELL',
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    fee DECIMAL(10, 2) DEFAULT 1.00,
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING, EXECUTED, CANCELLED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_client_id (client_id),
    INDEX idx_stock_id (stock_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des crédits (octroyés par les conseillers aux clients)
CREATE TABLE IF NOT EXISTS credits (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) NOT NULL,
    advisor_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    annual_interest_rate DECIMAL(5, 2) NOT NULL,
    insurance_rate DECIMAL(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    monthly_payment DECIMAL(10, 2) NOT NULL,
    remaining_capital DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    start_date DATETIME NULL,
    next_payment_date DATETIME NULL,
    paid_months INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_client_id (client_id),
    INDEX idx_advisor_id (advisor_id),
    INDEX idx_account_id (account_id),
    INDEX idx_status (status),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (advisor_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des actualités (créées par conseillers/directeurs, consultables par les clients)
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE,
    INDEX idx_author_id (author_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_published (is_published),
    FOREIGN KEY (author_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;