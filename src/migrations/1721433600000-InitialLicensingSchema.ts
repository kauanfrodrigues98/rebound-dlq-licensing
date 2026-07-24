import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialLicensingSchema1721433600000 implements MigrationInterface {
  name = 'InitialLicensingSchema1721433600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'license_instances',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '80',
            isPrimary: true,
          },
          {
            name: 'customer_id',
            type: 'varchar',
            length: '80',
          },
          {
            name: 'contract_id',
            type: 'varchar',
            length: '80',
          },
          {
            name: 'installation_name',
            type: 'varchar',
            length: '160',
          },
          {
            name: 'installation_fingerprint',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '32',
          },
          {
            name: 'current_version',
            type: 'integer',
          },
          {
            name: 'issued_at',
            type: 'timestamptz',
          },
          {
            name: 'expires_at',
            type: 'timestamptz',
          },
          {
            name: 'grace_period_until',
            type: 'timestamptz',
          },
          {
            name: 'last_check_in_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'license_instances',
      new TableIndex({
        name: 'idx_license_instances_customer_id',
        columnNames: ['customer_id'],
      }),
    );
    await queryRunner.createIndex(
      'license_instances',
      new TableIndex({
        name: 'idx_license_instances_contract_id',
        columnNames: ['contract_id'],
      }),
    );
    await queryRunner.createIndex(
      'license_instances',
      new TableIndex({
        name: 'idx_license_instances_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'license_tokens',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '80',
            isPrimary: true,
          },
          {
            name: 'license_instance_id',
            type: 'varchar',
            length: '80',
          },
          {
            name: 'token_hash',
            type: 'varchar',
            length: '128',
            isUnique: true,
          },
          {
            name: 'issued_at',
            type: 'timestamptz',
          },
          {
            name: 'expires_at',
            type: 'timestamptz',
          },
          {
            name: 'revoked_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'fk_license_tokens_license_instance',
            columnNames: ['license_instance_id'],
            referencedTableName: 'license_instances',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'license_tokens',
      new TableIndex({
        name: 'idx_license_tokens_license_instance_id',
        columnNames: ['license_instance_id'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'entitlement_snapshots',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '80',
            isPrimary: true,
          },
          {
            name: 'license_instance_id',
            type: 'varchar',
            length: '80',
          },
          {
            name: 'version',
            type: 'integer',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '32',
          },
          {
            name: 'entitlements',
            type: 'jsonb',
          },
          {
            name: 'valid_from',
            type: 'timestamptz',
          },
          {
            name: 'valid_until',
            type: 'timestamptz',
          },
          {
            name: 'grace_period_until',
            type: 'timestamptz',
          },
          {
            name: 'signature',
            type: 'varchar',
            length: '128',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        uniques: [
          {
            name: 'uq_entitlement_snapshots_license_version',
            columnNames: ['license_instance_id', 'version'],
          },
        ],
        foreignKeys: [
          {
            name: 'fk_entitlement_snapshots_license_instance',
            columnNames: ['license_instance_id'],
            referencedTableName: 'license_instances',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'entitlement_snapshots',
      new TableIndex({
        name: 'idx_entitlement_snapshots_license_instance_id',
        columnNames: ['license_instance_id'],
      }),
    );
    await queryRunner.createIndex(
      'entitlement_snapshots',
      new TableIndex({
        name: 'idx_entitlement_snapshots_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'license_check_ins',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '80',
            isPrimary: true,
          },
          {
            name: 'license_instance_id',
            type: 'varchar',
            length: '80',
          },
          {
            name: 'app_version',
            type: 'varchar',
            length: '64',
          },
          {
            name: 'current_license_version',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'usage_projects',
            type: 'integer',
          },
          {
            name: 'usage_users',
            type: 'integer',
          },
          {
            name: 'usage_monthly_events',
            type: 'integer',
          },
          {
            name: 'checked_at',
            type: 'timestamptz',
          },
        ],
        foreignKeys: [
          {
            name: 'fk_license_check_ins_license_instance',
            columnNames: ['license_instance_id'],
            referencedTableName: 'license_instances',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'license_check_ins',
      new TableIndex({
        name: 'idx_license_check_ins_license_instance_id',
        columnNames: ['license_instance_id'],
      }),
    );
    await queryRunner.createIndex(
      'license_check_ins',
      new TableIndex({
        name: 'idx_license_check_ins_checked_at',
        columnNames: ['checked_at'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('license_check_ins', true);
    await queryRunner.dropTable('entitlement_snapshots', true);
    await queryRunner.dropTable('license_tokens', true);
    await queryRunner.dropTable('license_instances', true);
  }
}
