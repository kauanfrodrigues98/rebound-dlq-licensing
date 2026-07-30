import { Inject, Injectable } from '@nestjs/common';
import { LICENSE_INSTANCE_REPOSITORY } from '../../ports/license-instance.repository';
import type { LicenseInstanceRepository } from '../../ports/license-instance.repository';
import { LICENSE_TOKEN_REPOSITORY } from '../../ports/license-token.repository';
import type { LicenseTokenRepository } from '../../ports/license-token.repository';
import { ListLicensesResult } from './list-licenses.result';

@Injectable()
export class ListLicensesUseCase {
  constructor(
    @Inject(LICENSE_INSTANCE_REPOSITORY)
    private readonly licenseInstances: LicenseInstanceRepository,
    @Inject(LICENSE_TOKEN_REPOSITORY)
    private readonly licenseTokens: LicenseTokenRepository,
  ) {}

  async execute(): Promise<ListLicensesResult> {
    const licenses = await this.licenseInstances.findAll();

    return {
      licenses: await Promise.all(
        licenses.map(async (license) => {
          const latestToken =
            await this.licenseTokens.findLatestByLicenseInstanceId(license.id);

          return {
            licenseInstanceId: license.id,
            customerId: license.customerId,
            contractId: license.contractId,
            installationName: license.installationName,
            installationFingerprint: license.installationFingerprint,
            licenseKey: latestToken?.licenseKey,
            status: license.status,
            version: license.currentVersion,
            issuedAt: license.issuedAt,
            expiresAt: license.expiresAt,
            gracePeriodUntil: license.gracePeriodUntil,
            lastCheckInAt: license.lastCheckInAt,
          };
        }),
      ),
    };
  }
}
