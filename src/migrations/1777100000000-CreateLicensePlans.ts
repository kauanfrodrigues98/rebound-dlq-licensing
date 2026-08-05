import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateLicensePlans1777100000000 implements MigrationInterface {
  name = 'CreateLicensePlans1777100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        schema: 'licensing',
        name: 'license_plans',
        columns: [
          { name: 'id', type: 'varchar', length: '80', isPrimary: true },
          { name: 'name', type: 'varchar', length: '120' },
          { name: 'description', type: 'text' },
          { name: 'cadence', type: 'varchar', length: '24' },
          { name: 'featured', type: 'boolean', default: false },
          { name: 'price_label', type: 'varchar', length: '80' },
          { name: 'entitlements', type: 'jsonb' },
          { name: 'active', type: 'boolean', default: true },
          { name: 'sort_order', type: 'integer', default: 0 },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'licensing.license_plans',
      new TableIndex({
        name: 'idx_license_plans_active',
        columnNames: ['active'],
      }),
    );
    await queryRunner.createIndex(
      'licensing.license_plans',
      new TableIndex({
        name: 'idx_license_plans_cadence',
        columnNames: ['cadence'],
      }),
    );
    await queryRunner.createIndex(
      'licensing.license_plans',
      new TableIndex({
        name: 'idx_license_plans_sort_order',
        columnNames: ['sort_order'],
      }),
    );

    await queryRunner.query(
      `
      INSERT INTO licensing.license_plans (
        id,
        name,
        description,
        cadence,
        featured,
        price_label,
        entitlements,
        active,
        sort_order
      ) VALUES
      ($1, $2, $3, $4, $5, $6, $7::jsonb, true, $8),
      ($9, $10, $11, $12, $13, $14, $15::jsonb, true, $16),
      ($17, $18, $19, $20, $21, $22, $23::jsonb, true, $24)
      ON CONFLICT (id) DO NOTHING
      `,
      [
        'self-hosted-starter',
        'Self-hosted Starter',
        'Operação inicial com limites previsíveis para pilotos.',
        'monthly',
        false,
        'R$ 990/mês',
        JSON.stringify({
          maxUsers: 10,
          maxProjects: 3,
          maxMonthlyEvents: 25000,
          retentionDays: 30,
          aiEnabled: false,
          automaticReplayEnabled: false,
          supportSlaHours: 72,
        }),
        10,
        'self-hosted-business',
        'Self-hosted Business',
        'Times em produção com IA, mais projetos e maior franquia.',
        'monthly',
        true,
        'R$ 2.490/mês',
        JSON.stringify({
          maxUsers: 50,
          maxProjects: 15,
          maxMonthlyEvents: 150000,
          retentionDays: 90,
          aiEnabled: true,
          automaticReplayEnabled: true,
          supportSlaHours: 24,
        }),
        20,
        'self-hosted-enterprise',
        'Self-hosted Enterprise',
        'Contrato customizado para ambientes críticos e alto volume.',
        'contract',
        false,
        'Sob contrato',
        JSON.stringify({
          maxUsers: 250,
          maxProjects: 100,
          maxMonthlyEvents: 1000000,
          retentionDays: 365,
          aiEnabled: true,
          automaticReplayEnabled: true,
          supportSlaHours: 8,
        }),
        30,
      ],
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('licensing.license_plans', true);
  }
}
