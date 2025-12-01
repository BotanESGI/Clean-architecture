import { DataSource } from "typeorm";
import { ClientEntity } from "./entities/ClientEntity";
import { AccountEntity } from "./entities/AccountEntity";
import { TransactionEntity } from "./entities/TransactionEntity";
import { BankSettingsEntity } from "./entities/BankSettingsEntity";

const fallbackHost = "cleanarch-mysql";
const fallbackPort = 3306;
const fallbackUser = "app_user";
const fallbackPassword = "app_password";
const fallbackDb = "clean_architecture_db";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || fallbackHost,
  port: parseInt(process.env.DB_PORT || fallbackPort.toString(), 10),
  username: process.env.DB_USER || fallbackUser,
  password: process.env.DB_PASSWORD || fallbackPassword,
  database: process.env.DB_NAME || fallbackDb,
  entities: [ClientEntity, AccountEntity, TransactionEntity, BankSettingsEntity],
  synchronize: false, // Désactivé car init.sql gère le schéma
  logging: process.env.NODE_ENV === "development",
});

