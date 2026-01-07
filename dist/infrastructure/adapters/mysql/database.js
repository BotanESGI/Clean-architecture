"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const ClientEntity_1 = require("./entities/ClientEntity");
const AccountEntity_1 = require("./entities/AccountEntity");
const TransactionEntity_1 = require("./entities/TransactionEntity");
const BankSettingsEntity_1 = require("./entities/BankSettingsEntity");
const StockEntity_1 = require("./entities/StockEntity");
const CreditEntity_1 = require("./entities/CreditEntity");
const PrivateMessageEntity_1 = require("./entities/PrivateMessageEntity");
const OrderEntity_1 = require("./entities/OrderEntity");
const fallbackHost = "cleanarch-mysql";
const fallbackPort = 3306;
const fallbackUser = "app_user";
const fallbackPassword = "app_password";
const fallbackDb = "clean_architecture_db";
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST || fallbackHost,
    port: parseInt(process.env.DB_PORT || fallbackPort.toString(), 10),
    username: process.env.DB_USER || fallbackUser,
    password: process.env.DB_PASSWORD || fallbackPassword,
    database: process.env.DB_NAME || fallbackDb,
    entities: [ClientEntity_1.ClientEntity, AccountEntity_1.AccountEntity, TransactionEntity_1.TransactionEntity, BankSettingsEntity_1.BankSettingsEntity, StockEntity_1.StockEntity, CreditEntity_1.CreditEntity, PrivateMessageEntity_1.PrivateMessageEntity, OrderEntity_1.OrderEntity],
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
});
