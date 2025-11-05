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
    role VARCHAR(20) DEFAULT 'client',
    isBanned BOOLEAN DEFAULT FALSE,
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

-- ========================================
-- DONNÉES INITIALES
-- ========================================

-- ========================================
-- CRÉER LE DIRECTEUR INITIAL
-- ========================================
-- Important : Après avoir lancé le serveur backend une première fois,
-- TypeORM va créer les tables automatiquement (synchronize: true).
-- Ensuite, vous pouvez créer le directeur en utilisant l'API :
--
-- POST http://localhost:4000/director/clients
-- Headers: { "Content-Type": "application/json", "Authorization": "Bearer <token_directeur>" }
-- Body: {
--   "firstName": "Jean",
--   "lastName": "Dupont", 
--   "email": "director@banqueavenir.fr",
--   "password": "Director@123",
--   "role": "director"
-- }
--
-- OU créer manuellement le premier directeur :
-- 1. Démarrez le serveur backend : npm run dev
-- 2. Dans la console Node.js, générez le hash :
--    const bcrypt = require('bcryptjs');
--    console.log(bcrypt.hashSync('Director@123', 10));
-- 3. Exécutez la requête SQL ci-dessous avec le hash généré :
--
-- INSERT INTO clients (id, firstName, lastName, email, passwordHashed, role, isBanned, isVerified, accountIds)
-- VALUES ('director-001', 'Jean', 'Dupont', 'director@banqueavenir.fr', 'VOTRE_HASH_ICI', 'director', 0, 1, '');

