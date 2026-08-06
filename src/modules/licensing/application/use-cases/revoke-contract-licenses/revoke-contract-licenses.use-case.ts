import { Inject, Injectable } from '@nestjs/common';
import { CLOCK_PORT } from '../../../../../shared/application/ports/clock.port';
import type { ClockPort } from '../../../../../shared/application/ports/clock.port';
import { ID_GENERATOR_PORT } from '../../../../../shared/application/ports/id-generator.port';
import type { IdGeneratorPort } from '../../../../../shared/application/ports/id-generator.port';
import { EntitlementSnapshot } from '../../../domain/entities/entitlement-snapshot.entity';
import { ENTITLEMENT_SNAPSHOT_REPOSITORY } from '../../ports/entitlement-snapshot.repository';
import type { EntitlementSnapshotRepository } from '../../ports/entitlement-snapshot.repository';
import { LICENSE_INSTANCE_REPOSITORY } from '../../ports/license-instance.repository';
import type { LicenseInstanceRepository } from '../../ports/license-instance.repository';
import { LICENSE_SIGNATURE_PORT } from '../../ports/license-signature.port';
import type { LicenseSignaturePort } from '../../ports/license-signature.port';
import { RevokeContractLicensesCommand } from './revoke-contract-licenses.command';
import { RevokeContractLicensesResult } from './revoke-contract-licenses.result';

@Injectable()
export class RevokeContractLicensesUseCase {
  constructor(
    @Inject(LICENSE_INSTANCE_REPOSITORY)
    private readonly licenseInstances: LicenseInstanceRepository,
    @Inject(ENTITLEMENT_SNAPSHOT_REPOSITORY)
    private readonly entitlementSnapshots: EntitlementSnapshotRepository,
    @Inject(LICENSE_SIGNATURE_PORT)
    private readonly licenseSignature: LicenseSignaturePort,
    @Inject(CLOCK_PORT)
    private readonly clock: ClockPort,
    @Inject(ID_GENERATOR_PORT)
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  async execute(
    command: RevokeContractLicensesCommand,
  ): Promise<RevokeContractLicensesResult> {
    const licenses = await this.licenseInstances.findByContractId(
      command.contractId,
    );
    const revocableLicenses = licenses.filter(
      (license) => license.status === 'active' || license.status === 'suspended',
    );
    const now = this.clock.now();

    for (const license of revocableLicenses) {
      const latestSnapshot =
        await this.entitlementSnapshots.findLatestByLicenseInstanceId(
          license.id,
        );

      license.revoke();

      const unsignedSnapshot = EntitlementSnapshot.create({
        id: this.idGenerator.generate('ent_snap'),
        licenseInstanceId: license.id,
        version: license.currentVersion,
        status: license.status,
        entitlements: latestSnapshot?.entitlements ?? {},
        validFrom: now,
        validUntil: now,
        gracePeriodUntil: now,
        createdAt: now,
      });
      const snapshot = unsignedSnapshot.withSignature(
        await this.licenseSignature.sign(unsignedSnapshot),
      );

      await this.licenseInstances.save(license);
      await this.entitlementSnapshots.save(snapshot);
    }

    return {
      contractId: command.contractId,
      revokedCount: revocableLicenses.length,
      licenseInstanceIds: revocableLicenses.map((license) => license.id),
    };
  }
}
