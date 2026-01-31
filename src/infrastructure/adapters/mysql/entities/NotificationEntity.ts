import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("notifications")
export class NotificationEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "receiver_id" })
  @Index("idx_receiver")
  receiverId!: string;

  @Column({ name: "sender_id" })
  @Index("idx_sender")
  senderId!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ name: "is_read", default: false })
  @Index("idx_receiver_read")
  isRead!: boolean;

  @CreateDateColumn({ name: "created_at" })
  @Index("idx_created_at")
  createdAt!: Date;
}
