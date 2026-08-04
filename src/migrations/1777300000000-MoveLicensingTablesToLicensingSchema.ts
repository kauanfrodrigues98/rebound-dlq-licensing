import { MigrationInterface, QueryRunner } from 'typeorm';

const licensingTableArray = `ARRAY[
  'license_instances',
  'license_tokens',
  'entitlement_snapshots',
  'license_check_ins',
  'license_plans'
]`;

export class MoveLicensingTablesToLicensingSchema1777300000000
  implements MigrationInterface
{
  name = 'MoveLicensingTablesToLicensingSchema1777300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "licensing"');
    await queryRunner.query(`
      DO $$
      DECLARE
        table_name text;
      BEGIN
        FOREACH table_name IN ARRAY ${licensingTableArray} LOOP
          IF to_regclass(format('public.%I', table_name)) IS NOT NULL
            AND to_regclass(format('licensing.%I', table_name)) IS NULL THEN
            EXECUTE format('ALTER TABLE public.%I SET SCHEMA licensing', table_name);
          END IF;
        END LOOP;
      END $$;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        table_name text;
      BEGIN
        FOREACH table_name IN ARRAY ${licensingTableArray} LOOP
          IF to_regclass(format('licensing.%I', table_name)) IS NOT NULL
            AND to_regclass(format('public.%I', table_name)) IS NULL THEN
            EXECUTE format('ALTER TABLE licensing.%I SET SCHEMA public', table_name);
          END IF;
        END LOOP;
      END $$;
    `);
    await queryRunner.query('DROP SCHEMA IF EXISTS "licensing"');
  }
}
