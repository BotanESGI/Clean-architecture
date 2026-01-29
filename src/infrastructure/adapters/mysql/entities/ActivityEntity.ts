import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("activities")
export class ActivityEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ length: 200 })
  title!: string;

  @Column("text")
  content!: string;

  @Column({ name: "author_id" })
  authorId!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  createdAt!: Date;

  @Column({ default: true, name: "is_published" })
  isPublished!: boolean;
}
