import { Inject, Injectable } from '@nestjs/common';
import { CLOCK_PORT } from '../../../../../shared/application/ports/clock.port';
import type { ClockPort } from '../../../../../shared/application/ports/clock.port';
import { LicenseKeyCodec } from '../../services/license-key-codec';
import { ENTITLEMENT_SNAPSHOT_REPOSITORY } from '../../ports/entitlement-snapshot.repository';
import type { EntitlementSnapshotRepository } from '../../ports/entitlement-snapshot.repository';
import { LICENSE_INSTANCE_REPOSITORY } from '../../ports/license-instance.repository';
import type { LicenseInstanceRepository } from '../../ports/license-instance.repository';
import { LICENSE_TOKEN_REPOSITORY } from '../../ports/license-token.repository';
import type { LicenseTokenRepository } from '../../ports/license-token.repository';
import { GetActiveContractLicenseQuery } from './get-active-contract-license.query';
import { GetActiveContractLicenseResult } from './get-active-contract-license.result';

@Injectable()
export class GetActiveContractLicenseUseCase {
  constructor(
    @Inject(LICENSE_INSTANCE_REPOSITORY)
    private readonly licenseInstances: LicenseInstanceRepository,
    @Inject(LICENSE_TOKEN_REPOSITORY)
    private readonly licenseTokens: LicenseTokenRepository,
    @Inject(ENTITLEMENT_SNAPSHOT_REPOSITORY)
    private readonly entitlementSnapshots: EntitlementSnapshotRepository,
    @Inject(CLOCK_PORT)
    private readonly clock: ClockPort,
  ) {}

  async execute(
    query: GetActiveContractLicenseQuery,
  ): Promise<GetActiveContractLicenseResult | null> {
    const now = this.clock.now();
    const licenses = await this.licenseInstances.findByContractId(query.contractId);
    const activeLicense = licenses.find(
      (license) =>
        license.status === 'active' &&
        license.expiresAt > now &&
        license.gracePeriodUntil > now,
    );

    if (!activeLicense) {
      return null;
    }

    const [latestToken, snapshot] = await Promise.all([
      this.licenseTokens.findLatestByLicenseInstanceId(activeLicense.id),
      this.entitlementSnapshots.findLatestByLicenseInstanceId(activeLicense.id),
    ]);

    if (!latestToken?.licenseKey || !latestToken.isActive(now) || !snapshot?.signature) {
      return null;
    }

    const decoded = LicenseKeyCodec.decode(latestToken.licenseKey);

    return {
      licenseInstanceId: activeLicense.id,
      licenseKey: latestToken.licenseKey,
      licenseToken: decoded.licenseToken,
      installationFingerprint: activeLicense.installationFingerprint,
      status: activeLicense.status,
      version: snapshot.version,
      expiresAt: activeLicense.expiresAt,
      gracePeriodUntil: activeLicense.gracePeriodUntil,
      entitlements: snapshot.entitlements,
      signature: snapshot.signature,
    };
  }
}
