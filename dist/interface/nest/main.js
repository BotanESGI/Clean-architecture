"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const body_parser_1 = __importDefault(require("body-parser"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const ClientController_1 = require("../controllers/ClientController");
const EmailService_1 = require("../../infrastructure/services/EmailService");
const RegisterClient_1 = require("../../application/use-cases/RegisterClient");
const ConfirmRegistration_1 = require("../../application/use-cases/ConfirmRegistration");
const LoginClient_1 = require("../../application/use-cases/LoginClient");
const database_1 = require("../../infrastructure/adapters/mysql/database");
const MySQLClientRepository_1 = require("../../infrastructure/adapters/mysql/MySQLClientRepository");
const MySQLAccountRepository_1 = require("../../infrastructure/adapters/mysql/MySQLAccountRepository");
const MySQLTransactionRepository_1 = require("../../infrastructure/adapters/mysql/MySQLTransactionRepository");
const AccountController_1 = require("../controllers/AccountController");
const CreateAccount_1 = require("../../application/use-cases/CreateAccount");
const RenameAccount_1 = require("../../application/use-cases/RenameAccount");
const CloseAccount_1 = require("../../application/use-cases/CloseAccount");
const TransferController_1 = require("../controllers/TransferController");
const TransferFunds_1 = require("../../application/use-cases/TransferFunds");
const VerifyBeneficiary_1 = require("../../application/use-cases/VerifyBeneficiary");
const ListTransactions_1 = require("../../application/use-cases/ListTransactions");
const TransactionController_1 = require("../controllers/TransactionController");
const DirectorController_1 = require("../controllers/DirectorController");
const ListAllClients_1 = require("../../application/use-cases/ListAllClients");
const BanClient_1 = require("../../application/use-cases/BanClient");
const UnbanClient_1 = require("../../application/use-cases/UnbanClient");
const UpdateClientInfo_1 = require("../../application/use-cases/UpdateClientInfo");
const DeleteClient_1 = require("../../application/use-cases/DeleteClient");
const CreateClientByDirector_1 = require("../../application/use-cases/CreateClientByDirector");
const SetSavingsRate_1 = require("../../application/use-cases/SetSavingsRate");
const MySQLBankSettingsRepository_1 = require("../../infrastructure/adapters/mysql/MySQLBankSettingsRepository");
const CalculateDailyInterest_1 = require("../../application/use-cases/CalculateDailyInterest");
const CalculateMissingInterest_1 = require("../../application/use-cases/CalculateMissingInterest");
const DailyInterestJob_1 = require("../../infrastructure/jobs/DailyInterestJob");
const SavingsController_1 = require("../controllers/SavingsController");
const MySQLStockRepository_1 = require("../../infrastructure/adapters/mysql/MySQLStockRepository");
const MySQLCreditRepository_1 = require("../../infrastructure/adapters/mysql/MySQLCreditRepository");
const CreateStock_1 = require("../../application/use-cases/CreateStock");
const UpdateStock_1 = require("../../application/use-cases/UpdateStock");
const DeleteStock_1 = require("../../application/use-cases/DeleteStock");
const ListAllStocks_1 = require("../../application/use-cases/ListAllStocks");
const InvestmentController_1 = require("../controllers/InvestmentController");
const CreateCredit_1 = require("../../application/use-cases/CreateCredit");
const ActivateCredit_1 = require("../../application/use-cases/ActivateCredit");
const ListCredits_1 = require("../../application/use-cases/ListCredits");
const RecordCreditPayment_1 = require("../../application/use-cases/RecordCreditPayment");
const CreditController_1 = require("../controllers/CreditController");
const requireDirector_1 = require("../middlewares/requireDirector");
const requireAdvisor_1 = require("../middlewares/requireAdvisor");
const createDirector_1 = require("../../infrastructure/seeds/createDirector");
const createAdvisor_1 = require("../../infrastructure/seeds/createAdvisor");
const MySQLPrivateMessageRepository_1 = require("../../infrastructure/adapters/mysql/MySQLPrivateMessageRepository");
const SendPrivateMessage_1 = require("../../application/use-cases/SendPrivateMessage");
const ListPrivateMessages_1 = require("../../application/use-cases/ListPrivateMessages");
const GetAvailableAdvisor_1 = require("../../application/use-cases/GetAvailableAdvisor");
const PrivateMessageController_1 = require("../controllers/PrivateMessageController");
const PrivateMessageSocket_1 = require("../../infrastructure/websocket/PrivateMessageSocket");
const SendNotification_1 = require("../../application/use-cases/SendNotification");
// --- Initialiser la base de données ---
async function initializeDatabase() {
    try {
        await database_1.AppDataSource.initialize();
        console.log("✅ Base de données MySQL connectée");
        console.log(`📊 Base de données: ${process.env.DB_NAME || "banque_avenir"}`);
        await (0, createDirector_1.seedDirector)(database_1.AppDataSource);
        await (0, createAdvisor_1.seedAdvisor)(database_1.AppDataSource);
    }
    catch (error) {
        console.error("❌ Erreur lors de la connexion à la base de données:", error);
        process.exit(1);
    }
}
// Fonction principale async pour initialiser tout
async function startServer() {
    // Initialiser la base de données avant de créer les repositories
    await initializeDatabase();
    // --- Repos & Services ---
    const clientRepository = new MySQLClientRepository_1.MySQLClientRepository(database_1.AppDataSource);
    const accountRepository = new MySQLAccountRepository_1.MySQLAccountRepository(database_1.AppDataSource);
    const transactionRepository = new MySQLTransactionRepository_1.MySQLTransactionRepository(database_1.AppDataSource);
    const bankSettingsRepository = new MySQLBankSettingsRepository_1.MySQLBankSettingsRepository(database_1.AppDataSource);
    const stockRepository = new MySQLStockRepository_1.MySQLStockRepository(database_1.AppDataSource);
    const creditRepository = new MySQLCreditRepository_1.MySQLCreditRepository(database_1.AppDataSource);
    const privateMessageRepository = new MySQLPrivateMessageRepository_1.MySQLPrivateMessageRepository(database_1.AppDataSource);
    const emailService = new EmailService_1.RealEmailService();
    const registerClient = new RegisterClient_1.RegisterClient(clientRepository, emailService);
    const confirmClient = new ConfirmRegistration_1.ConfirmClientRegistration(clientRepository, accountRepository);
    const loginClient = new LoginClient_1.LoginClient(clientRepository);
    // --- Controller (Client) ---
    const clientController = new ClientController_1.ClientController(registerClient, confirmClient, loginClient, clientRepository);
    // --- Use cases (Accounts) ---
    const createAccount = new CreateAccount_1.CreateAccount(accountRepository);
    const renameAccount = new RenameAccount_1.RenameAccount(accountRepository);
    const closeAccount = new CloseAccount_1.CloseAccount(accountRepository);
    // --- Use cases (Transfers) ---
    const transferFunds = new TransferFunds_1.TransferFunds(accountRepository, clientRepository, transactionRepository);
    const verifyBeneficiary = new VerifyBeneficiary_1.VerifyBeneficiary(accountRepository, clientRepository);
    // --- Use cases (Transactions) ---
    const listTransactions = new ListTransactions_1.ListTransactions(transactionRepository);
    // --- Use cases (Savings) ---
    const setSavingsRate = new SetSavingsRate_1.SetSavingsRate(bankSettingsRepository, accountRepository, clientRepository, emailService);
    const calculateDailyInterest = new CalculateDailyInterest_1.CalculateDailyInterest(accountRepository, bankSettingsRepository, transactionRepository);
    const calculateMissingInterest = new CalculateMissingInterest_1.CalculateMissingInterest(accountRepository, bankSettingsRepository, transactionRepository);
    // --- Use cases (Private Messages) ---
    const sendPrivateMessage = new SendPrivateMessage_1.SendPrivateMessage(privateMessageRepository, clientRepository);
    const listPrivateMessages = new ListPrivateMessages_1.ListPrivateMessages(privateMessageRepository, clientRepository);
    const getAvailableAdvisor = new GetAvailableAdvisor_1.GetAvailableAdvisor(clientRepository);
    const { ListAdvisorConversations } = await Promise.resolve().then(() => __importStar(require("../../application/use-cases/ListAdvisorConversations")));
    const listAdvisorConversations = new ListAdvisorConversations(privateMessageRepository, clientRepository);
    // --- Use cases (Director) ---
    const listAllClients = new ListAllClients_1.ListAllClients(clientRepository);
    const banClient = new BanClient_1.BanClient(clientRepository);
    const unbanClient = new UnbanClient_1.UnbanClient(clientRepository);
    const updateClientInfo = new UpdateClientInfo_1.UpdateClientInfo(clientRepository);
    const deleteClient = new DeleteClient_1.DeleteClient(clientRepository);
    const createClientByDirector = new CreateClientByDirector_1.CreateClientByDirector(clientRepository, accountRepository);
    const createStock = new CreateStock_1.CreateStock(stockRepository);
    const updateStock = new UpdateStock_1.UpdateStock(stockRepository);
    const deleteStock = new DeleteStock_1.DeleteStock(stockRepository);
    const listAllStocks = new ListAllStocks_1.ListAllStocks(stockRepository);
    // --- Use cases (Credits) ---
    const createCredit = new CreateCredit_1.CreateCredit(creditRepository, accountRepository, clientRepository);
    const activateCredit = new ActivateCredit_1.ActivateCredit(creditRepository, accountRepository, transactionRepository);
    const listCredits = new ListCredits_1.ListCredits(creditRepository);
    const recordCreditPayment = new RecordCreditPayment_1.RecordCreditPayment(creditRepository, accountRepository, transactionRepository);
    // --- Controller (Accounts) ---
    const accountController = new AccountController_1.AccountController(createAccount, renameAccount, closeAccount, accountRepository);
    // --- Controller (Transfers) ---
    const transferController = new TransferController_1.TransferController(transferFunds, verifyBeneficiary);
    // --- Controller (Transactions) ---
    const transactionController = new TransactionController_1.TransactionController(listTransactions);
    // --- Controller (Director) ---
    const directorController = new DirectorController_1.DirectorController(listAllClients, banClient, unbanClient, updateClientInfo, deleteClient, createClientByDirector, setSavingsRate, bankSettingsRepository, createStock, updateStock, deleteStock, listAllStocks);
    // --- Controller (Savings) ---
    const savingsController = new SavingsController_1.SavingsController(bankSettingsRepository);
    // --- Controller (Credits) ---
    const creditController = new CreditController_1.CreditController(createCredit, activateCredit, listCredits, recordCreditPayment, clientRepository);
    // --- Controller (Investment) ---
    const investmentController = new InvestmentController_1.InvestmentController(database_1.AppDataSource, stockRepository, accountRepository, transactionRepository, listAllStocks);
    // --- Controller (Private Messages) ---
    const privateMessageController = new PrivateMessageController_1.PrivateMessageController(listPrivateMessages, sendPrivateMessage, privateMessageRepository);
    // --- Job d'intérêts quotidiens ---
    const dailyInterestJob = new DailyInterestJob_1.DailyInterestJob(calculateDailyInterest);
    // Calculer les intérêts manquants au démarrage (si le serveur a été redémarré)
    try {
        console.log("🔄 Calcul des intérêts manquants au démarrage...");
        const result = await calculateMissingInterest.execute();
        if (result.accountsProcessed > 0) {
            console.log(`✅ Intérêts manquants calculés: ${result.accountsProcessed} comptes traités, ` +
                `${result.totalInterest.toFixed(2)}€ d'intérêts distribués`);
        }
        else {
            console.log("✅ Aucun intérêt manquant à calculer");
        }
    }
    catch (error) {
        console.error("⚠️ Erreur lors du calcul des intérêts manquants:", error);
    }
    // Démarrer le job (exécute tous les jours à minuit)
    dailyInterestJob.start();
    // --- App & HTTP Server ---
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    // Middlewares de base DOIVENT être configurés AVANT NestJS
    app.use(body_parser_1.default.json());
    // --- WebSocket Server ---
    const privateMessageSocket = new PrivateMessageSocket_1.PrivateMessageSocket(httpServer, sendPrivateMessage, listPrivateMessages, clientRepository);
    // --- Use case SendNotification (doit être créé après le WebSocket) ---
    const sendNotificationCallback = (clientId, title, message) => {
        // Envoyer via WebSocket
        privateMessageSocket.sendMessageToUser(clientId, "notification", {
            title,
            message,
        });
    };
    const sendNotification = new SendNotification_1.SendNotification(clientRepository, sendNotificationCallback);
    // --- Controller (Notifications) Express ---
    const { NotificationController } = await Promise.resolve().then(() => __importStar(require("../controllers/NotificationController")));
    const notificationController = new NotificationController(sendNotification);
    // --- Intégration NestJS (2ème framework backend pour respecter la contrainte) ---
    // On a choisi NestJS pour le module notifications car il offre une bonne gestion des dépendances
    const { NotificationModule } = await Promise.resolve().then(() => __importStar(require("../nestjs/notification/notification.module")));
    // Créer l'app NestJS en utilisant l'adaptateur Express pour partager le même serveur
    const nestApp = await core_1.NestFactory.create(NotificationModule.forRoot(clientRepository, sendNotificationCallback), new platform_express_1.ExpressAdapter(app), { logger: false } // Pas besoin de logger NestJS, on utilise déjà celui d'Express
    );
    // Activer CORS dans NestJS (nécessaire même si Express l'a déjà)
    nestApp.enableCors({
        origin: (origin, callback) => {
            const FRONT_ORIGINS = (process.env.FRONT_ORIGIN || "http://localhost:3000,http://localhost:3001")
                .split(",")
                .map(o => o.trim());
            if (!origin)
                return callback(null, true);
            const allowed = FRONT_ORIGINS.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
            callback(allowed ? null : new Error("Origin not allowed"), allowed);
        },
    });
    // Préfixe pour éviter les conflits avec les routes Express
    nestApp.setGlobalPrefix('api/v2');
    // Initialiser NestJS sans démarrer un serveur séparé (on utilise celui d'Express)
    await nestApp.init();
    console.log('✅ NestJS intégré - Routes disponibles sous /api/v2/notifications');
    // Allow cross-origin requests from dev frontends (Next.js dev servers)
    const FRONT_ORIGINS = (process.env.FRONT_ORIGIN || "http://localhost:3000,http://localhost:3001")
        .split(",")
        .map(o => o.trim());
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const allowed = FRONT_ORIGINS.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
            callback(allowed ? null : new Error("Origin not allowed"), allowed);
        },
    }));
    app.use((req, res, next) => {
        if (req.method === "OPTIONS") {
            const origin = req.headers.origin || "*";
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
    // --- Routes Investment (public + client) ---
    app.get("/stocks", investmentController.listStocks);
    app.post("/invest/orders", investmentController.place);
    app.get("/invest/orders", investmentController.listClientOrders);
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
        }
        catch (err) {
            res.status(404).json({ message: err.message });
        }
    });
    app.get("/private-messages/:advisorId", privateMessageController.list);
    app.post("/private-messages", privateMessageController.send);
    app.get("/private-messages/unread/count", privateMessageController.getUnreadCount);
    // --- Routes Advisor ---
    app.get("/advisor/conversations", requireAdvisor_1.requireAdvisor, async (req, res) => {
        try {
            // Le middleware requireAdvisor met déjà le user dans req.user
            const userId = req.user?.clientId;
            console.log("📨 Requête /advisor/conversations pour userId:", userId);
            if (!userId) {
                console.error("❌ Utilisateur non authentifié");
                return res.status(401).json({ message: "Utilisateur non authentifié" });
            }
            const conversations = await listAdvisorConversations.execute(userId);
            console.log("✅ Conversations récupérées:", conversations.length);
            res.status(200).json({ conversations });
        }
        catch (err) {
            console.error("❌ Erreur dans /advisor/conversations:", err);
            res.status(400).json({ message: err.message || "Erreur lors de la récupération des conversations" });
        }
    });
    app.post("/advisor/notifications", requireAdvisor_1.requireAdvisor, notificationController.send);
    // --- Routes Director ---
    app.post("/director/clients", requireDirector_1.requireDirector, directorController.createClient);
    app.get("/director/clients", requireDirector_1.requireDirector, directorController.listClients);
    app.post("/director/clients/:id/ban", requireDirector_1.requireDirector, directorController.ban);
    app.post("/director/clients/:id/unban", requireDirector_1.requireDirector, directorController.unban);
    app.put("/director/clients/:id", requireDirector_1.requireDirector, directorController.update);
    app.delete("/director/clients/:id", requireDirector_1.requireDirector, directorController.remove);
    app.get("/director/savings-rate", requireDirector_1.requireDirector, directorController.getSavingsRate);
    app.post("/director/savings-rate", requireDirector_1.requireDirector, directorController.updateSavingsRate);
    // --- Routes Director (Actions) ---
    app.post("/director/stocks", requireDirector_1.requireDirector, directorController.createStock);
    app.get("/director/stocks", requireDirector_1.requireDirector, directorController.listStocks);
    app.put("/director/stocks/:id", requireDirector_1.requireDirector, directorController.updateStock);
    app.delete("/director/stocks/:id", requireDirector_1.requireDirector, directorController.removeStock);
    // --- Routes Advisor (Credits) ---
    app.get("/advisor/clients", requireAdvisor_1.requireAdvisor, creditController.listClients);
    app.post("/advisor/credits/preview", requireAdvisor_1.requireAdvisor, creditController.calculatePreview);
    app.post("/advisor/credits", requireAdvisor_1.requireAdvisor, creditController.create);
    app.get("/advisor/credits", requireAdvisor_1.requireAdvisor, creditController.list);
    app.post("/advisor/credits/:creditId/activate", requireAdvisor_1.requireAdvisor, creditController.activate);
    app.post("/advisor/credits/:creditId/payment", requireAdvisor_1.requireAdvisor, creditController.recordPayment);
    // --- Routes Admin (pour tests) ---
    app.post("/admin/calculate-interest", async (_req, res) => {
        try {
            await dailyInterestJob.execute();
            res.status(200).json({ message: "Calcul des intérêts exécuté avec succès" });
        }
        catch (err) {
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
        }
        catch (err) {
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
