import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity("conversations")
export class ConversationEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "client_id", unique: true })
  @Index("idx_client")
  clientId!: string;

  @Column({ name: "assigned_advisor_id", type: "varchar", length: 255, nullable: true })
  @Index("idx_advisor")
  assignedAdvisorId!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}

