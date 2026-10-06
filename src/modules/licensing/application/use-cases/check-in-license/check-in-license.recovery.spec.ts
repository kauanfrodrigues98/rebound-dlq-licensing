import { CheckInLicenseUseCase } from './check-in-license.use-case';
const command = {
  licenseToken: 'test',
  installationFingerprint: 'fingerprint',
  currentLicenseVersion: 1,
  appVersion: 'test',
  usage: { projects: 0, users: 0, monthlyEvents: 0 },
};
function fixture(
  status = 'suspended',
  revoked = false,
  fingerprint = true,
  financial = true,
) {
  const token = {
    licenseInstanceId: 'test-license',
    revokedAt: revoked ? new Date() : undefined,
    isActive: () => false,
  };
  const snapshot = {
    signature: 'test-signature',
    status,
    version: 2,
    validUntil: new Date(),
    gracePeriodUntil: new Date(),
    entitlements: {
      financialManaged: financial,
      financialSuspended: financial,
    },
  };
  return new CheckInLicenseUseCase(
    {
      findById: async () => ({
        id: 'test-license',
        status,
        matchesFingerprint: () => fingerprint,
      }),
    } as any,
    { findByTokenHash: async () => token } as any,
    { hash: () => 'hash' } as any,
    { findLatestByLicenseInstanceId: async () => snapshot } as any,
    { now: () => new Date() } as any,
  );
}
describe('financial check-in recovery', () => {
  it('retrieves a financially suspended snapshot with an expired credential', async () => {
    await expect(fixture().execute(command)).resolves.toMatchObject({
      status: 'suspended',
      version: 2,
    });
  });
  it('rejects revoked credentials, revoked licenses and mismatched installations', async () => {
    await expect(fixture('suspended', true).execute(command)).rejects.toThrow();
    await expect(fixture('revoked').execute(command)).rejects.toThrow();
    await expect(
      fixture('suspended', false, false).execute(command),
    ).rejects.toThrow();
  });
  it('does not extend recovery to an expired unmanaged credential', async () => {
    await expect(
      fixture('active', false, true, false).execute(command),
    ).rejects.toThrow();
  });
});
