import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("clients")
export class ClientEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ name: "first_name" })
  firstName!: string;

  @Column({ name: "last_name" })
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: "password_hash" })
  passwordHashed!: string;

  @Column({ name: "is_verified", default: false })
  isVerified!: boolean;

  @Column({ name: "verification_token", nullable: true })
  verificationToken?: string;

  @Column({ default: 'CLIENT' })
  role!: string;

  @Column({ name: "is_banned", default: false })
  isBanned!: boolean;
}

