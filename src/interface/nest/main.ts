import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import cors from "cors";

import { ClientController } from "../controllers/ClientController";
import { RealEmailService } from "../../infrastructure/services/EmailService";
import { RegisterClient } from "../../application/use-cases/RegisterClient";
import { ConfirmClientRegistration } from "../../application/use-cases/ConfirmRegistration";
import { LoginClient } from "../../application/use-cases/LoginClient";

import { InMemoryClientRepository } from "../../infrastructure/adapters/in-memory/InMemoryClientRepo";
import { InMemoryAccountRepository } from "../../infrastructure/adapters/in-memory/InMemoryAccountRepo";


import { AccountController } from "../controllers/AccountController";
import { CreateAccount } from "../../application/use-cases/CreateAccount";
import { RenameAccount } from "../../application/use-cases/RenameAccount";
import { CloseAccount } from "../../application/use-cases/CloseAccount";

// --- Repos & Services ---
const clientRepository = new InMemoryClientRepository();
const accountRepository = new InMemoryAccountRepository();
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

// --- Controller (Accounts) ---
const accountController = new AccountController(
  createAccount,
  renameAccount,
  closeAccount,
  accountRepository
);

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

// --- Health endpoint ---
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// --- Port configurable (évite conflit avec Next.js) ---
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
