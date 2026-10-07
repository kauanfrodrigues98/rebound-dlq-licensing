import { licenseGracePeriod } from './license-grace-policy';
describe('license grace policy', () => {
  const expiresAt = new Date('2026-11-01T03:00:00Z');
  it('ends courtesy on the exact agreed date', () => {
    expect(licenseGracePeriod(expiresAt, { courtesy: true })).toEqual(
      expiresAt,
    );
  });
  it('preserves the normal seven-day grace', () => {
    expect(licenseGracePeriod(expiresAt, {})).toEqual(
      new Date('2026-11-08T03:00:00Z'),
    );
  });
});
