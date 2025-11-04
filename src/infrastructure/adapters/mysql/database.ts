import { DataSource } from "typeorm";
import { ClientEntity } from "./entities/ClientEntity";
import { AccountEntity } from "./entities/AccountEntity";
import { TransactionEntity } from "./entities/TransactionEntity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "banque_avenir",
  entities: [ClientEntity, AccountEntity, TransactionEntity],
  synchronize: true, // Crée automatiquement les tables (à désactiver en production)
  logging: process.env.NODE_ENV === "development",
});

