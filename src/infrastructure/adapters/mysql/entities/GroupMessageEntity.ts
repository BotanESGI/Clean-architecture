import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("group_messages")
export class GroupMessageEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "sender_id" })
  @Index("idx_sender")
  senderId!: string;

  @Column({ name: "sender_role", length: 50 })
  senderRole!: string;

  @Column({ name: "sender_name", length: 255 })
  senderName!: string;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn({ name: "created_at" })
  @Index("idx_created_at")
  createdAt!: Date;
}
