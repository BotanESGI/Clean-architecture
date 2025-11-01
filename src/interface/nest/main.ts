import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";

import { ClientController } from "../controllers/ClientController";
import { RealEmailService } from "../../infrastructure/services/EmailService";
import { RegisterClient } from "../../application/use-cases/RegisterClient";
import { ConfirmClientRegistration } from "../../application/use-cases/ConfirmRegistration";
import { LoginClient } from "../../application/use-cases/LoginClient";

import { InMemoryClientRepository } from "../../infrastructure/adapters/in-memory/InMemoryClientRepo";
import { InMemoryAccountRepository } from "../../infrastructure/adapters/in-memory/InMemoryAccountRepo";

// 👉 Comptes (nouveaux imports)
import { AccountController } from "../controllers/AccountController";
import { CreateAccount } from "../../application/use-cases/CreateAccount";
import { RenameAccount } from "../../application/use-cases/RenameAccount";
import { CloseAccount } from "../../application/use-cases/CloseAccount";

// --- Repos & Services ---
const clientRepository = new InMemoryClientRepository();
const accountRepository = new InMemoryAccountRepository();
const emailService = new RealEmailService();

// --- Use cases (Client) ---
const registerClient = new RegisterClient(clientRepository, emailService);
const confirmClient = new ConfirmClientRegistration(clientRepository, accountRepository);
const loginClient = new LoginClient(clientRepository);

// --- Controller (Client) ---
const clientController = new ClientController(registerClient, confirmClient, loginClient);

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

// --- Routes Client ---
app.post("/clients/register", clientController.register);
app.get("/clients/confirm/:token", clientController.confirm);
app.post("/clients/login", clientController.login);

// --- Routes Comptes ---
app.post("/accounts", accountController.create);
app.patch("/accounts/:id", accountController.rename);
app.delete("/accounts/:id", accountController.close);
app.get("/accounts", accountController.listByClient);

// --- Port configurable (évite conflit avec Next.js) ---
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
