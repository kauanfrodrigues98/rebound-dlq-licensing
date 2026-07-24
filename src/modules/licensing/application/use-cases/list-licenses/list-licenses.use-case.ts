import { Inject, Injectable } from '@nestjs/common';
import { LICENSE_INSTANCE_REPOSITORY } from '../../ports/license-instance.repository';
import type { LicenseInstanceRepository } from '../../ports/license-instance.repository';
import { ListLicensesResult } from './list-licenses.result';

@Injectable()
export class ListLicensesUseCase {
  constructor(
    @Inject(LICENSE_INSTANCE_REPOSITORY)
    private readonly licenseInstances: LicenseInstanceRepository,
  ) {}

  async execute(): Promise<ListLicensesResult> {
    const licenses = await this.licenseInstances.findAll();

    return {
      licenses: licenses.map((license) => ({
        licenseInstanceId: license.id,
        customerId: license.customerId,
        contractId: license.contractId,
        installationName: license.installationName,
        installationFingerprint: license.installationFingerprint,
        status: license.status,
        version: license.currentVersion,
        issuedAt: license.issuedAt,
        expiresAt: license.expiresAt,
        gracePeriodUntil: license.gracePeriodUntil,
        lastCheckInAt: license.lastCheckInAt,
      })),
    };
  }
}
