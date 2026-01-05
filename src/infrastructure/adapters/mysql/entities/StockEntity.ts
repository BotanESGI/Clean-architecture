import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("stocks")
export class StockEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  symbol!: string;

  @Column()
  name!: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0, name: "current_price" })
  currentPrice!: number;

  @Column({ default: true, name: "is_available" })
  isAvailable!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}

