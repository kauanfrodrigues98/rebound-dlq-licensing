import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'license_check_ins', schema: 'licensing' })
export class LicenseCheckInOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 80 })
  id!: string;

  @Index()
  @Column({ name: 'license_instance_id', type: 'varchar', length: 80 })
  licenseInstanceId!: string;

  @Column({ name: 'app_version', type: 'varchar', length: 64 })
  appVersion!: string;

  @Column({ name: 'current_license_version', type: 'integer', nullable: true })
  currentLicenseVersion!: number | null;

  @Column({ name: 'usage_projects', type: 'integer' })
  usageProjects!: number;

  @Column({ name: 'usage_users', type: 'integer' })
  usageUsers!: number;

  @Column({ name: 'usage_monthly_events', type: 'integer' })
  usageMonthlyEvents!: number;

  @Index()
  @Column({ name: 'checked_at', type: 'timestamptz' })
  checkedAt!: Date;
}
