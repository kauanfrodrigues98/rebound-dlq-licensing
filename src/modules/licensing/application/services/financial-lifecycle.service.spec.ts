import { FinancialLifecycleService } from './financial-lifecycle.service';
import { ConflictException } from '@nestjs/common';
const contractId = '00000000-0000-4000-8000-000000000001';
const customerId = '00000000-0000-4000-8000-000000000002';
function fixture() {
  const query = jest.fn(async (sql: string) => {
    if (sql.includes('SELECT i.id'))
      return [
        {
          id: 'lic-test',
          customer_id: customerId,
          current_version: 1,
          status: 'active',
        },
      ];
    return [];
  });
  const source = { transaction: (fn: any) => fn({ query }) };
  const signer = { sign: jest.fn(async () => 'signed-test-snapshot') };
  return {
    service: new FinancialLifecycleService(source as any, signer),
    signer,
  };
}
function input(accessState: string) {
  return {
    customerId,
    sourceVersion: 1,
    state: 'active',
    validUntil: new Date(Date.now() - 86400000).toISOString(),
    graceDays: 8,
    entitlements: {
      financialManaged: true,
      financialAccessState: accessState,
      financialSuspendAt: new Date(Date.now() + 86400000).toISOString(),
      maxUsers: 1,
    },
  };
}
describe('financial licensing deadlines', () => {
  it('signs the exact restriction deadline supplied by Control', async () => {
    const f = fixture(),
      body = input('payment_restricted');
    await f.service.apply(contractId, body);
    const snapshot = f.signer.sign.mock.calls[0][0];
    expect(snapshot.gracePeriodUntil.toISOString()).toBe(
      body.entitlements.financialSuspendAt,
    );
    expect(snapshot.entitlements.financialAccessState).toBe(
      'payment_restricted',
    );
    expect(snapshot.entitlements.financialSuspended).toBe(false);
  });
  it('does not revive an expired paid period as healthy', async () => {
    const f = fixture();
    await expect(
      f.service.apply(contractId, input('healthy')),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(f.signer.sign).not.toHaveBeenCalled();
  });
});
