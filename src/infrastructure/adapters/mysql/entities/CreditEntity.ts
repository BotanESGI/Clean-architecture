import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("credits")
export class CreditEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "client_id" })
  clientId!: string;

  @Column({ name: "advisor_id" })
  advisorId!: string;

  @Column({ name: "account_id" })
  accountId!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @Column({ name: "annual_interest_rate", type: "decimal", precision: 5, scale: 2 })
  annualInterestRate!: number;

  @Column({ name: "insurance_rate", type: "decimal", precision: 5, scale: 2 })
  insuranceRate!: number;

  @Column({ name: "duration_months" })
  durationMonths!: number;

  @Column({ name: "monthly_payment", type: "decimal", precision: 10, scale: 2 })
  monthlyPayment!: number;

  @Column({ name: "remaining_capital", type: "decimal", precision: 10, scale: 2 })
  remainingCapital!: number;

  @Column({
    type: "enum",
    enum: ["pending", "active", "completed", "cancelled"],
    default: "pending",
  })
  status!: string;

  @Column({ name: "start_date", type: "datetime", nullable: true })
  startDate?: Date;

  @Column({ name: "next_payment_date", type: "datetime", nullable: true })
  nextPaymentDate?: Date;

  @Column({ name: "paid_months", default: 0 })
  paidMonths!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}

