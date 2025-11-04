import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("clients")
export class ClientEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHashed!: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column("simple-array", { nullable: true })
  accountIds?: string[];
}

