import { DataSource } from "typeorm";
import { ClientEntity } from "./entities/ClientEntity";
import { AccountEntity } from "./entities/AccountEntity";
import { TransactionEntity } from "./entities/TransactionEntity";
import { BankSettingsEntity } from "./entities/BankSettingsEntity";
import { StockEntity } from "./entities/StockEntity";
import { CreditEntity } from "./entities/CreditEntity";
import { PrivateMessageEntity } from "./entities/PrivateMessageEntity";
import { GroupMessageEntity } from "./entities/GroupMessageEntity";
import { NotificationEntity } from "./entities/NotificationEntity";
import { OrderEntity } from "./entities/OrderEntity";
import { ConversationEntity } from "./entities/ConversationEntity";
import { ActivityEntity } from "./entities/ActivityEntity";

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
  entities: [ClientEntity, AccountEntity, TransactionEntity, BankSettingsEntity, StockEntity, CreditEntity, PrivateMessageEntity, GroupMessageEntity, OrderEntity, ConversationEntity, ActivityEntity, NotificationEntity],
  synchronize: false, 
  logging: process.env.NODE_ENV === "development",
});

