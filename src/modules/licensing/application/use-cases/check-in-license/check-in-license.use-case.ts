import { Inject, Injectable } from '@nestjs/common';
import { CLOCK_PORT } from '../../../../../shared/application/ports/clock.port';
import type { ClockPort } from '../../../../../shared/application/ports/clock.port';
import { InstallationFingerprintMismatchError } from '../../../domain/errors/installation-fingerprint-mismatch.error';
import { InvalidLicenseTokenError } from '../../../domain/errors/invalid-license-token.error';
import { LicenseNotActiveError } from '../../../domain/errors/license-not-active.error';
import { LicenseNotFoundError } from '../../../domain/errors/license-not-found.error';
import { ENTITLEMENT_SNAPSHOT_REPOSITORY } from '../../ports/entitlement-snapshot.repository';
import type { EntitlementSnapshotRepository } from '../../ports/entitlement-snapshot.repository';
import { LICENSE_INSTANCE_REPOSITORY } from '../../ports/license-instance.repository';
import type { LicenseInstanceRepository } from '../../ports/license-instance.repository';
import { LICENSE_TOKEN_REPOSITORY } from '../../ports/license-token.repository';
import type { LicenseTokenRepository } from '../../ports/license-token.repository';
import { LICENSE_TOKEN_HASHER_PORT } from '../../ports/license-token-hasher.port';
import type { LicenseTokenHasherPort } from '../../ports/license-token-hasher.port';
import { CheckInLicenseCommand } from './check-in-license.command';
import { CheckInLicenseResult } from './check-in-license.result';

@Injectable()
export class CheckInLicenseUseCase {
  constructor(
    @Inject(LICENSE_INSTANCE_REPOSITORY)
    private readonly licenseInstances: LicenseInstanceRepository,
    @Inject(LICENSE_TOKEN_REPOSITORY)
    private readonly licenseTokens: LicenseTokenRepository,
    @Inject(LICENSE_TOKEN_HASHER_PORT)
    private readonly tokenHasher: LicenseTokenHasherPort,
    @Inject(ENTITLEMENT_SNAPSHOT_REPOSITORY)
    private readonly entitlementSnapshots: EntitlementSnapshotRepository,
    @Inject(CLOCK_PORT)
    private readonly clock: ClockPort,
  ) {}

  async execute(command: CheckInLicenseCommand): Promise<CheckInLicenseResult> {
    const now = this.clock.now();
    const tokenHash = this.tokenHasher.hash(command.licenseToken);
    const token = await this.licenseTokens.findByTokenHash(tokenHash);

    if (!token?.isActive(now)) {
      throw new InvalidLicenseTokenError();
    }

    const licenseInstance = await this.licenseInstances.findById(
      token.licenseInstanceId,
    );

    if (!licenseInstance) {
      throw new LicenseNotFoundError(token.licenseInstanceId);
    }

    if (!licenseInstance.matchesFingerprint(command.installationFingerprint)) {
      throw new InstallationFingerprintMismatchError();
    }

    if (licenseInstance.status !== 'active') {
      throw new LicenseNotActiveError(licenseInstance.status);
    }

    const snapshot =
      await this.entitlementSnapshots.findLatestByLicenseInstanceId(
        licenseInstance.id,
      );

    if (!snapshot?.signature) {
      throw new LicenseNotFoundError(licenseInstance.id);
    }

    return {
      licenseInstanceId: licenseInstance.id,
      status: snapshot.status,
      version: snapshot.version,
      hasUpdate: snapshot.version !== command.currentLicenseVersion,
      expiresAt: snapshot.validUntil,
      gracePeriodUntil: snapshot.gracePeriodUntil,
      entitlements: snapshot.entitlements,
      signature: snapshot.signature,
    };
  }
}
