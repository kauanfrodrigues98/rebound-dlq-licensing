import { Inject, Injectable } from '@nestjs/common';
import { LicenseNotFoundError } from '../../../domain/errors/license-not-found.error';
import { ENTITLEMENT_SNAPSHOT_REPOSITORY } from '../../ports/entitlement-snapshot.repository';
import type { EntitlementSnapshotRepository } from '../../ports/entitlement-snapshot.repository';
import { GetCurrentLicenseQuery } from './get-current-license.query';
import { GetCurrentLicenseResult } from './get-current-license.result';

@Injectable()
export class GetCurrentLicenseUseCase {
  constructor(
    @Inject(ENTITLEMENT_SNAPSHOT_REPOSITORY)
    private readonly entitlementSnapshots: EntitlementSnapshotRepository,
  ) {}

  async execute(
    query: GetCurrentLicenseQuery,
  ): Promise<GetCurrentLicenseResult> {
    const snapshot =
      await this.entitlementSnapshots.findLatestByLicenseInstanceId(
        query.licenseInstanceId,
      );

    if (!snapshot?.signature) {
      throw new LicenseNotFoundError(query.licenseInstanceId);
    }

    return {
      licenseInstanceId: snapshot.licenseInstanceId,
      status: snapshot.status,
      version: snapshot.version,
      expiresAt: snapshot.validUntil,
      gracePeriodUntil: snapshot.gracePeriodUntil,
      entitlements: snapshot.entitlements,
      signature: snapshot.signature,
    };
  }
}
