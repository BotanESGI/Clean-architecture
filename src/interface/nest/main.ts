import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import cors from "cors";

import { ClientController } from "../controllers/ClientController";
import { RealEmailService } from "../../infrastructure/services/EmailService";
import { RegisterClient } from "../../application/use-cases/RegisterClient";
import { ConfirmClientRegistration } from "../../application/use-cases/ConfirmRegistration";
import { LoginClient } from "../../application/use-cases/LoginClient";

import { AppDataSource } from "../../infrastructure/adapters/mysql/database";
import { MySQLClientRepository } from "../../infrastructure/adapters/mysql/MySQLClientRepository";
import { MySQLAccountRepository } from "../../infrastructure/adapters/mysql/MySQLAccountRepository";
import { MySQLTransactionRepository } from "../../infrastructure/adapters/mysql/MySQLTransactionRepository";

import { AccountController } from "../controllers/AccountController";
import { CreateAccount } from "../../application/use-cases/CreateAccount";
import { RenameAccount } from "../../application/use-cases/RenameAccount";
import { CloseAccount } from "../../application/use-cases/CloseAccount";
import { TransferController } from "../controllers/TransferController";
import { TransferFunds } from "../../application/use-cases/TransferFunds";
import { VerifyBeneficiary } from "../../application/use-cases/VerifyBeneficiary";
import { ListTransactions } from "../../application/use-cases/ListTransactions";
import { TransactionController } from "../controllers/TransactionController";

// --- Initialiser la base de données ---
async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Base de données MySQL connectée");
    console.log(`📊 Base de données: ${process.env.DB_NAME || "banque_avenir"}`);
  } catch (error) {
    console.error("❌ Erreur lors de la connexion à la base de données:", error);
    process.exit(1);
  }
}

// Fonction principale async pour initialiser tout
async function startServer() {
  // Initialiser la base de données avant de créer les repositories
  await initializeDatabase();

  // --- Repos & Services ---
  const clientRepository = new MySQLClientRepository(AppDataSource);
  const accountRepository = new MySQLAccountRepository(AppDataSource);
  const transactionRepository = new MySQLTransactionRepository(AppDataSource);
  const emailService = new RealEmailService();

  const registerClient = new RegisterClient(clientRepository, emailService);
  const confirmClient = new ConfirmClientRegistration(clientRepository, accountRepository);
  const loginClient = new LoginClient(clientRepository);

  // --- Controller (Client) ---
  const clientController = new ClientController(registerClient, confirmClient, loginClient, clientRepository);

  // --- Use cases (Accounts) ---
  const createAccount = new CreateAccount(accountRepository);
  const renameAccount = new RenameAccount(accountRepository);
  const closeAccount = new CloseAccount(accountRepository);

  // --- Use cases (Transfers) ---
  const transferFunds = new TransferFunds(accountRepository, clientRepository, transactionRepository);
  const verifyBeneficiary = new VerifyBeneficiary(accountRepository, clientRepository);

  // --- Use cases (Transactions) ---
  const listTransactions = new ListTransactions(transactionRepository);

  // --- Controller (Accounts) ---
  const accountController = new AccountController(
    createAccount,
    renameAccount,
    closeAccount,
    accountRepository
  );

  // --- Controller (Transfers) ---
  const transferController = new TransferController(transferFunds, verifyBeneficiary);

  // --- Controller (Transactions) ---
  const transactionController = new TransactionController(listTransactions);

  // --- App ---
  const app = express();
  app.use(bodyParser.json());

  // Allow cross-origin requests from dev frontends (Next.js dev servers)
  const FRONT_ORIGINS = (process.env.FRONT_ORIGIN || "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map(o => o.trim());

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); 
      const allowed = FRONT_ORIGINS.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
      callback(allowed ? null : new Error("Origin not allowed"), allowed);
    },
  }));

  app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      const origin = (req.headers.origin as string) || "*";
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.sendStatus(204);
    }
    next();
  });

  // --- Routes Client ---
  app.post("/clients/register", clientController.register);
  app.get("/clients/confirm/:token", clientController.confirm);
  app.post("/clients/login", clientController.login);
  app.get("/clients/:id", clientController.getById);

  // --- Routes Comptes ---
  app.post("/accounts", accountController.create);
  app.patch("/accounts/:id", accountController.rename);
  app.delete("/accounts/:id", accountController.close);
  app.get("/accounts", accountController.listByClient);
  app.get("/accounts/:clientId/balance", accountController.getBalance);
  app.get("/accounts/:clientId/iban", accountController.getIban);

  // --- Routes Transfers ---
  app.post("/transfers", transferController.transfer);
  app.post("/beneficiaries/verify", transferController.verify);

  // --- Routes Transactions ---
  app.get("/transactions", transactionController.list);

  // --- Health endpoint ---
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", database: "connected" });
  });

  // --- Port configurable (évite conflit avec Next.js) ---
  const PORT = Number(process.env.PORT ?? 4000);
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  });
}

// Démarrer le serveur
startServer().catch((error) => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});
