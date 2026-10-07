export function licenseGracePeriod(
  expiresAt: Date,
  entitlements: Readonly<Record<string, boolean | number | string>>,
): Date {
  const grace = new Date(expiresAt);
  if (entitlements.courtesy !== true) grace.setDate(grace.getDate() + 7);
  return grace;
}
