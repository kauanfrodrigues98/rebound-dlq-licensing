import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddLicensePlanDeployment1791100800000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query("ALTER TABLE licensing.license_plans ADD COLUMN deployment varchar(24) NOT NULL DEFAULT 'self_hosted' CHECK (deployment IN ('cloud','self_hosted'))");
    await q.query("UPDATE licensing.license_plans SET deployment='cloud' WHERE id IN ('free','individual','team','enterprise')");
  }
  async down(q: QueryRunner) {
    await q.query('ALTER TABLE licensing.license_plans DROP COLUMN deployment');
  }
}
