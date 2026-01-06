import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("orders")
export class OrderEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "client_id" })
  clientId!: string;

  @Column({ name: "stock_id" })
  stockId!: string;

  @Column()
  type!: string; // "BUY" | "SELL"

  @Column()
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 1 })
  fee!: number;

  @Column({ default: "PENDING" })
  status!: string; // "PENDING" | "EXECUTED" | "CANCELLED"

  @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}

