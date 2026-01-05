import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("bank_settings")
export class BankSettingsEntity {
  @PrimaryColumn({ default: "default" })
  id!: string;

  @Column("decimal", { name: "savings_rate", precision: 5, scale: 4, default: 0.01 })
  savingsRate!: number; // Taux d'épargne en pourcentage (ex: 0.01 = 1%)

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}

