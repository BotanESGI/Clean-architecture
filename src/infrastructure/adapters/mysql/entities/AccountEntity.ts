import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { TransactionEntity } from "./TransactionEntity";

@Entity("accounts")
export class AccountEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  clientId!: string;

  @Column({ unique: true })
  iban!: string;

  @Column({ default: "Compte courant" })
  name!: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  balance!: number;

  @Column({ default: false })
  isClosed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.account)
  transactions!: TransactionEntity[];
}

