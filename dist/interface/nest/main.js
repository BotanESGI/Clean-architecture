"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
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
// --- Initialiser la base de données ---
async function initializeDatabase() {
    try {
        await database_1.AppDataSource.initialize();
        console.log("✅ Base de données MySQL connectée");
        console.log(`📊 Base de données: ${process.env.DB_NAME || "banque_avenir"}`);
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
    // --- Controller (Accounts) ---
    const accountController = new AccountController_1.AccountController(createAccount, renameAccount, closeAccount, accountRepository);
    // --- Controller (Transfers) ---
    const transferController = new TransferController_1.TransferController(transferFunds, verifyBeneficiary);
    // --- Controller (Transactions) ---
    const transactionController = new TransactionController_1.TransactionController(listTransactions);
    // --- App ---
    const app = (0, express_1.default)();
    app.use(body_parser_1.default.json());
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
