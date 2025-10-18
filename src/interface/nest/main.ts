import express from "express";
import bodyParser from "body-parser";
import { ClientController } from "../controllers/ClientController";
import "dotenv/config";

import { RealEmailService } from "../../infrastructure/services/EmailService";
import { RegisterClient } from "../../application/use-cases/RegisterClient";
import { ConfirmClientRegistration } from "../../application/use-cases/ConfirmRegistration";
import { InMemoryClientRepository } from "../../infrastructure/adapters/in-memory/InMemoryClientRepo";
import { InMemoryAccountRepository } from "../../infrastructure/adapters/in-memory/InMemoryAccountRepo";
import { LoginClient } from "../../application/use-cases/LoginClient";

const clientRepository = new InMemoryClientRepository();
const accountRepository = new InMemoryAccountRepository();
const emailService = new RealEmailService();

const registerClient = new RegisterClient(clientRepository, emailService);
const confirmClient = new ConfirmClientRegistration(clientRepository, accountRepository);
const loginClient = new LoginClient(clientRepository);

const clientController = new ClientController(registerClient, confirmClient,loginClient);

const app = express();
app.use(bodyParser.json());

app.post("/clients/register", clientController.register);
app.get("/clients/confirm/:token", clientController.confirm);
app.post("/clients/login", clientController.login);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
