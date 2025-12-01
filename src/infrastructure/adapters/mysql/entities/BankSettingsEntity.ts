import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("bank_settings")
export class BankSettingsEntity {
  @PrimaryColumn({ default: "default" })
  id!: string;

  @Column("decimal", { precision: 5, scale: 4, default: 0.01 })
  savingsRate!: number; // Taux d'épargne en pourcentage (ex: 0.01 = 1%)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

