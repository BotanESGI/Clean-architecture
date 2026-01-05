import "reflect-metadata";
import express from "express";
import { createServer, Server as HTTPServer } from "http";
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
import { DirectorController } from "../controllers/DirectorController";
import { ListAllClients } from "../../application/use-cases/ListAllClients";
import { BanClient } from "../../application/use-cases/BanClient";
import { UnbanClient } from "../../application/use-cases/UnbanClient";
import { UpdateClientInfo } from "../../application/use-cases/UpdateClientInfo";
import { DeleteClient } from "../../application/use-cases/DeleteClient";
import { CreateClientByDirector } from "../../application/use-cases/CreateClientByDirector";
import { SetSavingsRate } from "../../application/use-cases/SetSavingsRate";
import { MySQLBankSettingsRepository } from "../../infrastructure/adapters/mysql/MySQLBankSettingsRepository";
import { CalculateDailyInterest } from "../../application/use-cases/CalculateDailyInterest";
import { CalculateMissingInterest } from "../../application/use-cases/CalculateMissingInterest";
import { DailyInterestJob } from "../../infrastructure/jobs/DailyInterestJob";
import { SavingsController } from "../controllers/SavingsController";
import { MySQLStockRepository } from "../../infrastructure/adapters/mysql/MySQLStockRepository";
import { MySQLCreditRepository } from "../../infrastructure/adapters/mysql/MySQLCreditRepository";
import { CreateStock } from "../../application/use-cases/CreateStock";
import { UpdateStock } from "../../application/use-cases/UpdateStock";
import { DeleteStock } from "../../application/use-cases/DeleteStock";
import { ListAllStocks } from "../../application/use-cases/ListAllStocks";
import { CreateCredit } from "../../application/use-cases/CreateCredit";
import { ActivateCredit } from "../../application/use-cases/ActivateCredit";
import { ListCredits } from "../../application/use-cases/ListCredits";
import { RecordCreditPayment } from "../../application/use-cases/RecordCreditPayment";
import { CreditController } from "../controllers/CreditController";
import { requireDirector } from "../middlewares/requireDirector";
import { requireAdvisor } from "../middlewares/requireAdvisor";
import { seedDirector } from "../../infrastructure/seeds/createDirector";
import { seedAdvisor } from "../../infrastructure/seeds/createAdvisor";
import { MySQLPrivateMessageRepository } from "../../infrastructure/adapters/mysql/MySQLPrivateMessageRepository";
import { SendPrivateMessage } from "../../application/use-cases/SendPrivateMessage";
import { ListPrivateMessages } from "../../application/use-cases/ListPrivateMessages";
import { GetAvailableAdvisor } from "../../application/use-cases/GetAvailableAdvisor";
import { PrivateMessageController } from "../controllers/PrivateMessageController";
import { PrivateMessageSocket } from "../../infrastructure/websocket/PrivateMessageSocket";
import { SendNotification } from "../../application/use-cases/SendNotification";
import jwt from "jsonwebtoken";

// --- Initialiser la base de données ---
async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Base de données MySQL connectée");
    console.log(`📊 Base de données: ${process.env.DB_NAME || "banque_avenir"}`);
    
    await seedDirector(AppDataSource);
    await seedAdvisor(AppDataSource);
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
  const bankSettingsRepository = new MySQLBankSettingsRepository(AppDataSource);
  const stockRepository = new MySQLStockRepository(AppDataSource);
  const creditRepository = new MySQLCreditRepository(AppDataSource);
  const privateMessageRepository = new MySQLPrivateMessageRepository(AppDataSource);
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

  // --- Use cases (Savings) ---
  const setSavingsRate = new SetSavingsRate(
    bankSettingsRepository,
    accountRepository,
    clientRepository,
    emailService
  );
  const calculateDailyInterest = new CalculateDailyInterest(
    accountRepository,
    bankSettingsRepository,
    transactionRepository
  );
  const calculateMissingInterest = new CalculateMissingInterest(
    accountRepository,
    bankSettingsRepository,
    transactionRepository
  );

  // --- Use cases (Private Messages) ---
  const sendPrivateMessage = new SendPrivateMessage(privateMessageRepository, clientRepository);
  const listPrivateMessages = new ListPrivateMessages(privateMessageRepository, clientRepository);
  const getAvailableAdvisor = new GetAvailableAdvisor(clientRepository);
  const { ListAdvisorConversations } = await import("../../application/use-cases/ListAdvisorConversations");
  const listAdvisorConversations = new ListAdvisorConversations(privateMessageRepository, clientRepository);

  // --- Use cases (Director) ---
  const listAllClients = new ListAllClients(clientRepository);
  const banClient = new BanClient(clientRepository);
  const unbanClient = new UnbanClient(clientRepository);
  const updateClientInfo = new UpdateClientInfo(clientRepository);
  const deleteClient = new DeleteClient(clientRepository);
  const createClientByDirector = new CreateClientByDirector(
    clientRepository,
    accountRepository
  );
  const createStock = new CreateStock(stockRepository);
  const updateStock = new UpdateStock(stockRepository);
  const deleteStock = new DeleteStock(stockRepository);
  const listAllStocks = new ListAllStocks(stockRepository);

  // --- Use cases (Credits) ---
  const createCredit = new CreateCredit(creditRepository, accountRepository, clientRepository);
  const activateCredit = new ActivateCredit(creditRepository, accountRepository, transactionRepository);
  const listCredits = new ListCredits(creditRepository);
  const recordCreditPayment = new RecordCreditPayment(creditRepository, accountRepository, transactionRepository);

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

  // --- Controller (Director) ---
  const directorController = new DirectorController(
    listAllClients,
    banClient,
    unbanClient,
    updateClientInfo,
    deleteClient,
    createClientByDirector,
    setSavingsRate,
    bankSettingsRepository,
    createStock,
    updateStock,
    deleteStock,
    listAllStocks
  );

  // --- Controller (Savings) ---
  const savingsController = new SavingsController(bankSettingsRepository);

  // --- Controller (Credits) ---
  const creditController = new CreditController(
    createCredit,
    activateCredit,
    listCredits,
    recordCreditPayment,
    clientRepository
  );

  // --- Controller (Private Messages) ---
  const privateMessageController = new PrivateMessageController(
    listPrivateMessages,
    sendPrivateMessage,
    privateMessageRepository
  );

  // --- Job d'intérêts quotidiens ---
  const dailyInterestJob = new DailyInterestJob(calculateDailyInterest);
  
  // Calculer les intérêts manquants au démarrage (si le serveur a été redémarré)
  try {
    console.log("🔄 Calcul des intérêts manquants au démarrage...");
    const result = await calculateMissingInterest.execute();
    if (result.accountsProcessed > 0) {
      console.log(
        `✅ Intérêts manquants calculés: ${result.accountsProcessed} comptes traités, ` +
        `${result.totalInterest.toFixed(2)}€ d'intérêts distribués`
      );
    } else {
      console.log("✅ Aucun intérêt manquant à calculer");
    }
  } catch (error) {
    console.error("⚠️ Erreur lors du calcul des intérêts manquants:", error);
  }
  
  // Démarrer le job (exécute tous les jours à minuit)
  dailyInterestJob.start();

  // --- App & HTTP Server ---
  const app = express();
  const httpServer = createServer(app);
  
  // --- WebSocket Server ---
  const privateMessageSocket = new PrivateMessageSocket(
    httpServer,
    sendPrivateMessage,
    listPrivateMessages,
    clientRepository
  );

  // --- Use case SendNotification (doit être créé après le WebSocket) ---
  const sendNotification = new SendNotification(
    clientRepository,
    (clientId: string, title: string, message: string) => {
      // Envoyer via WebSocket
      privateMessageSocket.sendMessageToUser(clientId, "notification", {
        title,
        message,
      });
    }
  );

  // --- Controller (Notifications) ---
  const { NotificationController } = await import("../controllers/NotificationController");
  const notificationController = new NotificationController(sendNotification);

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

  // Middleware de logging pour debug
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
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

  // --- Routes Savings (public) ---
  app.get("/savings-rate", savingsController.getSavingsRate);

  // --- Routes Private Messages ---
  app.get("/private-messages/advisor", async (_req, res) => {
    try {
      const advisor = await getAvailableAdvisor.execute();
      res.status(200).json({
        id: advisor.getId(),
        firstName: advisor.getFirstName(),
        lastName: advisor.getLastName(),
        email: advisor.getEmail()
      });
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  });
  app.get("/private-messages/:advisorId", privateMessageController.list);
  app.post("/private-messages", privateMessageController.send);
  app.get("/private-messages/unread/count", privateMessageController.getUnreadCount);

  // --- Routes Advisor ---
  app.get("/advisor/conversations", requireAdvisor, async (req, res) => {
    try {
      // Le middleware requireAdvisor met déjà le user dans req.user
      const userId = (req as any).user?.clientId;
      console.log("📨 Requête /advisor/conversations pour userId:", userId);
      if (!userId) {
        console.error("❌ Utilisateur non authentifié");
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }
      const conversations = await listAdvisorConversations.execute(userId);
      console.log("✅ Conversations récupérées:", conversations.length);
      res.status(200).json({ conversations });
    } catch (err: any) {
      console.error("❌ Erreur dans /advisor/conversations:", err);
      res.status(400).json({ message: err.message || "Erreur lors de la récupération des conversations" });
    }
  });
  app.post("/advisor/notifications", requireAdvisor, notificationController.send);

  // --- Routes Director ---
  app.post("/director/clients", requireDirector, directorController.createClient);
  app.get("/director/clients", requireDirector, directorController.listClients);
  app.post("/director/clients/:id/ban", requireDirector, directorController.ban);
  app.post("/director/clients/:id/unban", requireDirector, directorController.unban);
  app.put("/director/clients/:id", requireDirector, directorController.update);
  app.delete("/director/clients/:id", requireDirector, directorController.remove);
  app.get("/director/savings-rate", requireDirector, directorController.getSavingsRate);
  app.post("/director/savings-rate", requireDirector, directorController.updateSavingsRate);
  
  // --- Routes Director (Actions) ---
  app.post("/director/stocks", requireDirector, directorController.createStock);
  app.get("/director/stocks", requireDirector, directorController.listStocks);
  app.put("/director/stocks/:id", requireDirector, directorController.updateStock);
  app.delete("/director/stocks/:id", requireDirector, directorController.removeStock);

  // --- Routes Advisor (Credits) ---
  app.get("/advisor/clients", requireAdvisor, creditController.listClients);
  app.post("/advisor/credits/preview", requireAdvisor, creditController.calculatePreview);
  app.post("/advisor/credits", requireAdvisor, creditController.create);
  app.get("/advisor/credits", requireAdvisor, creditController.list);
  app.post("/advisor/credits/:creditId/activate", requireAdvisor, creditController.activate);
  app.post("/advisor/credits/:creditId/payment", requireAdvisor, creditController.recordPayment);

  // --- Routes Admin (pour tests) ---
  app.post("/admin/calculate-interest", async (_req, res) => {
    try {
      await dailyInterestJob.execute();
      res.status(200).json({ message: "Calcul des intérêts exécuté avec succès" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/admin/calculate-missing-interest", async (_req, res) => {
    try {
      const result = await calculateMissingInterest.execute();
      res.status(200).json({
        message: "Calcul des intérêts manquants exécuté avec succès",
        accountsProcessed: result.accountsProcessed,
        totalInterest: result.totalInterest
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // --- Health endpoint ---
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", database: "connected" });
  });

  // --- Port configurable (évite conflit avec Next.js) ---
  const PORT = Number(process.env.PORT ?? 4000);
  httpServer.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    console.log(`🔌 WebSocket disponible sur ws://localhost:${PORT}`);
  });
}

// Démarrer le serveur
startServer().catch((error) => {
  console.error("❌ Erreur fatale:", error);
  process.exit(1);
});
