import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { AccountEntity } from "./AccountEntity";

@Entity("transactions")
export class TransactionEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "accountId" })
  accountId!: string;

  @ManyToOne(() => AccountEntity, (account) => account.transactions)
  @JoinColumn({ name: "accountId" })
  account!: AccountEntity;

  @Column()
  type!: string; // "transfer_in" | "transfer_out"

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @Column()
  label!: string;

  @Column({ name: "relatedAccountId", nullable: true })
  relatedAccountId?: string;

  @Column({ name: "relatedClientName", nullable: true })
  relatedClientName?: string;

  @CreateDateColumn({ name: "createdAt" })
  createdAt!: Date;
}

