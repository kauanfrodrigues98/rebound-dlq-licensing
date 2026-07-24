import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { LicenseStatus } from '../../../../domain/value-objects/license-status.vo';

@Entity('license_instances')
export class LicenseInstanceOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 80 })
  id!: string;

  @Index()
  @Column({ name: 'customer_id', type: 'varchar', length: 80 })
  customerId!: string;

  @Index()
  @Column({ name: 'contract_id', type: 'varchar', length: 80 })
  contractId!: string;

  @Column({ name: 'installation_name', type: 'varchar', length: 160 })
  installationName!: string;

  @Index({ unique: true })
  @Column({
    name: 'installation_fingerprint',
    type: 'varchar',
    length: 255,
  })
  installationFingerprint!: string;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  status!: LicenseStatus;

  @Column({ name: 'current_version', type: 'integer' })
  currentVersion!: number;

  @Column({ name: 'issued_at', type: 'timestamptz' })
  issuedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'grace_period_until', type: 'timestamptz' })
  gracePeriodUntil!: Date;

  @Column({ name: 'last_check_in_at', type: 'timestamptz', nullable: true })
  lastCheckInAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
