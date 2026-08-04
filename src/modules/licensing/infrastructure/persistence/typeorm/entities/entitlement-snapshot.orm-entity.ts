import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import { EntitlementValue } from '../../../../domain/entities/entitlement-snapshot.entity';
import type { LicenseStatus } from '../../../../domain/value-objects/license-status.vo';

@Entity({ name: 'entitlement_snapshots', schema: 'licensing' })
@Index(['licenseInstanceId', 'version'], { unique: true })
export class EntitlementSnapshotOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 80 })
  id!: string;

  @Index()
  @Column({ name: 'license_instance_id', type: 'varchar', length: 80 })
  licenseInstanceId!: string;

  @Column({ type: 'integer' })
  version!: number;

  @Index()
  @Column({ type: 'varchar', length: 32 })
  status!: LicenseStatus;

  @Column({ type: 'jsonb' })
  entitlements!: Record<string, EntitlementValue>;

  @Column({ name: 'valid_from', type: 'timestamptz' })
  validFrom!: Date;

  @Column({ name: 'valid_until', type: 'timestamptz' })
  validUntil!: Date;

  @Column({ name: 'grace_period_until', type: 'timestamptz' })
  gracePeriodUntil!: Date;

  @Column({ type: 'varchar', length: 128 })
  signature!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
