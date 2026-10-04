import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateFinancialLifecycle1791082800000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(
      `CREATE TABLE licensing.financial_lifecycle (contract_id varchar(80) PRIMARY KEY,source_version bigint NOT NULL,request_hash text NOT NULL,response jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now())`,
    );
  }
  async down(q: QueryRunner) {
    await q.query('DROP TABLE licensing.financial_lifecycle');
  }
}
