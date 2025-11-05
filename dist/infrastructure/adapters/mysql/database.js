"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const ClientEntity_1 = require("./entities/ClientEntity");
const AccountEntity_1 = require("./entities/AccountEntity");
const TransactionEntity_1 = require("./entities/TransactionEntity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "banque_avenir",
    entities: [ClientEntity_1.ClientEntity, AccountEntity_1.AccountEntity, TransactionEntity_1.TransactionEntity],
    synchronize: true, // Crée automatiquement les tables (à désactiver en production)
    logging: process.env.NODE_ENV === "development",
});
