import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { LicensePlanCadence } from '../../../../domain/entities/license-plan.entity';

@Entity('license_plans')
export class LicensePlanOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 80 })
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Index()
  @Column({ type: 'varchar', length: 24 })
  cadence!: LicensePlanCadence;

  @Index()
  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ name: 'price_label', type: 'varchar', length: 80 })
  priceLabel!: string;

  @Column({ type: 'jsonb' })
  entitlements!: Record<string, boolean | number | string>;

  @Index()
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Index()
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
