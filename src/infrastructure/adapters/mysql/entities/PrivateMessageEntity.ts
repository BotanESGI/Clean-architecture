import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("private_messages")
export class PrivateMessageEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "sender_id" })
  @Index("idx_sender")
  senderId!: string;

  @Column({ name: "receiver_id" })
  @Index("idx_receiver")
  receiverId!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ name: "is_read", default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}

