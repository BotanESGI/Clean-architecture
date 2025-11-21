import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { TransactionEntity } from "./TransactionEntity";

@Entity("accounts")
export class AccountEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "client_id" })
  clientId!: string;

  @Column({ unique: true })
  iban!: string;

  @Column({ name: "custom_name", default: "Compte courant" })
  name!: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  balance!: number;

  @Column({ name: "is_closed", default: false })
  isClosed!: boolean;

  @Column({ name: "account_type", type: "enum", enum: ["checking", "savings"], default: "checking" })
  accountType!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.account)
  transactions!: TransactionEntity[];
}

