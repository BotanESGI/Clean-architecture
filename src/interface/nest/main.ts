import express from "express";
import bodyParser from "body-parser";
import { ClientController } from "../controllers/ClientController";
import "dotenv/config";
import cors from "cors";

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
// Allow cross-origin requests from dev frontends (Next.js dev servers)
const FRONT_ORIGINS = (process.env.FRONT_ORIGIN || "http://localhost:3000,http://localhost:3001").split(",").map(o => o.trim());

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

app.post("/clients/register", clientController.register);
app.get("/clients/confirm/:token", clientController.confirm);
app.post("/clients/login", clientController.login);

// Simple health endpoint to verify the API server and port
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
