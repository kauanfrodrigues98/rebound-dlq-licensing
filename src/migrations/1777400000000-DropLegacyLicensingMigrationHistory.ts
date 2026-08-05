import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropLegacyLicensingMigrationHistory1777400000000
  implements MigrationInterface
{
  name = 'DropLegacyLicensingMigrationHistory1777400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS public.typeorm_migrations');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.typeorm_migrations (
        id SERIAL PRIMARY KEY,
        timestamp bigint NOT NULL,
        name varchar NOT NULL
      )
    `);
    await queryRunner.query(`
      INSERT INTO public.typeorm_migrations (timestamp, name)
      SELECT timestamp, name
      FROM licensing.typeorm_migrations lm
      WHERE lm.name IN (
        'InitialLicensingSchema1721433600000',
        'CreateLicensePlans1777100000000',
        'AddLicenseKeyToLicenseTokens1777200000000',
        'MoveLicensingTablesToLicensingSchema1777300000000'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.typeorm_migrations pm
        WHERE pm.timestamp = lm.timestamp
          AND pm.name = lm.name
      )
    `);
  }
}
