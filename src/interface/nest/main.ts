import express from "express";
import bodyParser from "body-parser";

import { RegisterClient } from "../../application/use-cases/RegisterClient";
import { ConfirmClientRegistration } from "../../application/use-cases/ConfirmRegistration";

import { InMemoryClientRepository } from "../../infrastructure/adapters/in-memory/InMemoryClientRepo";
import { InMemoryAccountRepository } from "../../infrastructure/adapters/in-memory/InMemoryAccountRepo";
import { FakeEmailService } from "../../infrastructure/services/FakeEmailService";

import { ClientController } from "../controllers/ClientController";

// 🔧 Initialisation des dépendances (infrastructure)
const clientRepository = new InMemoryClientRepository();
const accountRepository = new InMemoryAccountRepository();
const emailService = new FakeEmailService();

// 🧠 Cas d’utilisation (application)
const registerClient = new RegisterClient(clientRepository, emailService);
const confirmClient = new ConfirmClientRegistration(clientRepository, accountRepository);

// 🎮 Contrôleur (interface)
const clientController = new ClientController(registerClient, confirmClient);

// 🚀 Serveur Express
const app = express();
app.use(bodyParser.json());

// Routes API
app.post("/clients/register", clientController.register);
app.get("/clients/confirm/:id", clientController.confirm);

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
  console.log("📩 Pour tester : POST /clients/register puis GET /clients/confirm/:id");
});

