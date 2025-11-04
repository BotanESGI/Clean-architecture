-- Script SQL pour créer la base de données MySQL
-- Exécuter ce script pour initialiser la base de données

CREATE DATABASE IF NOT EXISTS banque_avenir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE banque_avenir;

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHashed VARCHAR(255) NOT NULL,
    isVerified BOOLEAN DEFAULT FALSE,
    accountIds TEXT
);

-- Table des comptes
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(36) PRIMARY KEY,
    clientId VARCHAR(36) NOT NULL,
    iban VARCHAR(34) UNIQUE NOT NULL,
    name VARCHAR(255) DEFAULT 'Compte courant',
    balance DECIMAL(10, 2) DEFAULT 0.00,
    isClosed BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_clientId (clientId),
    INDEX idx_iban (iban)
);

-- Table des transactions (liée à accounts via accountId)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    accountId VARCHAR(36) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    label VARCHAR(255) NOT NULL,
    relatedAccountId VARCHAR(36),
    relatedClientName VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_accountId (accountId),
    INDEX idx_createdAt (createdAt),
    FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
);

