import { MigrationInterface, QueryRunner } from 'typeorm';
export class SeedCloudLicensePlans1791097200000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(
      `INSERT INTO licensing.license_plans(id,name,description,cadence,featured,price_label,entitlements,active,sort_order) VALUES($1,$2,$3,'monthly',false,'Gerenciado pelo Billing',$4,true,$5) ON CONFLICT(id) DO NOTHING`,
      [
        'free',
        'Free',
        'Plano cloud inicial; limites editáveis no Control',
        '{"maxUsers":1,"maxProjects":1,"maxMonthlyEvents":300,"retentionDays":7,"aiEnabled":false,"maxAiAnalysisMonthly":0,"maxPayloadReplaysMonthly":0,"manualReplayEnabled":false,"automaticReplayEnabled":false}',
        0,
      ],
    );
    await q.query(
      `INSERT INTO licensing.license_plans(id,name,description,cadence,featured,price_label,entitlements,active,sort_order) VALUES($1,$2,$3,'monthly',false,'Gerenciado pelo Billing',$4,true,$5) ON CONFLICT(id) DO NOTHING`,
      [
        'individual',
        'Individual',
        'Plano cloud inicial; limites editáveis no Control',
        '{"maxUsers":1,"maxProjects":3,"maxMonthlyEvents":1500,"retentionDays":30,"aiEnabled":true,"maxAiAnalysisMonthly":100,"maxPayloadReplaysMonthly":30,"manualReplayEnabled":true,"automaticReplayEnabled":false}',
        1,
      ],
    );
    await q.query(
      `INSERT INTO licensing.license_plans(id,name,description,cadence,featured,price_label,entitlements,active,sort_order) VALUES($1,$2,$3,'monthly',false,'Gerenciado pelo Billing',$4,true,$5) ON CONFLICT(id) DO NOTHING`,
      [
        'team',
        'Team',
        'Plano cloud inicial; limites editáveis no Control',
        '{"maxUsers":"unlimited","maxProjects":"unlimited","maxMonthlyEvents":10000,"retentionDays":90,"aiEnabled":true,"maxAiAnalysisMonthly":500,"maxPayloadReplaysMonthly":300,"manualReplayEnabled":true,"automaticReplayEnabled":true}',
        2,
      ],
    );
    await q.query(
      `INSERT INTO licensing.license_plans(id,name,description,cadence,featured,price_label,entitlements,active,sort_order) VALUES($1,$2,$3,'monthly',false,'Gerenciado pelo Billing',$4,true,$5) ON CONFLICT(id) DO NOTHING`,
      [
        'enterprise',
        'Enterprise',
        'Plano cloud inicial; limites editáveis no Control',
        '{"maxUsers":"unlimited","maxProjects":"unlimited","maxMonthlyEvents":50000,"retentionDays":180,"aiEnabled":true,"maxAiAnalysisMonthly":3000,"maxPayloadReplaysMonthly":2000,"manualReplayEnabled":true,"automaticReplayEnabled":true}',
        3,
      ],
    );
  }
  async down() {
    /* Keep catalog entries that may already be referenced by contracts. */
  }
}
