import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('license_tokens')
export class LicenseTokenOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 80 })
  id!: string;

  @Index()
  @Column({ name: 'license_instance_id', type: 'varchar', length: 80 })
  licenseInstanceId!: string;

  @Index({ unique: true })
  @Column({ name: 'token_hash', type: 'varchar', length: 128 })
  tokenHash!: string;

  @Column({ name: 'license_key', type: 'text', nullable: true })
  licenseKey!: string | null;

  @Column({ name: 'issued_at', type: 'timestamptz' })
  issuedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
