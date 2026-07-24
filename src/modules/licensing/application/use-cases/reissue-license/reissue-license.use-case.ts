import { Inject, Injectable } from '@nestjs/common';
import { CLOCK_PORT } from '../../../../../shared/application/ports/clock.port';
import type { ClockPort } from '../../../../../shared/application/ports/clock.port';
import { ID_GENERATOR_PORT } from '../../../../../shared/application/ports/id-generator.port';
import type { IdGeneratorPort } from '../../../../../shared/application/ports/id-generator.port';
import { EntitlementSnapshot } from '../../../domain/entities/entitlement-snapshot.entity';
import { LicenseNotFoundError } from '../../../domain/errors/license-not-found.error';
import { ENTITLEMENT_SNAPSHOT_REPOSITORY } from '../../ports/entitlement-snapshot.repository';
import type { EntitlementSnapshotRepository } from '../../ports/entitlement-snapshot.repository';
import { LICENSE_INSTANCE_REPOSITORY } from '../../ports/license-instance.repository';
import type { LicenseInstanceRepository } from '../../ports/license-instance.repository';
import { LICENSE_SIGNATURE_PORT } from '../../ports/license-signature.port';
import type { LicenseSignaturePort } from '../../ports/license-signature.port';
import { ReissueLicenseCommand } from './reissue-license.command';
import { ReissueLicenseResult } from './reissue-license.result';

@Injectable()
export class ReissueLicenseUseCase {
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

  async execute(command: ReissueLicenseCommand): Promise<ReissueLicenseResult> {
    const licenseInstance = await this.licenseInstances.findById(
      command.licenseInstanceId,
    );

    if (!licenseInstance) {
      throw new LicenseNotFoundError(command.licenseInstanceId);
    }

    const gracePeriodUntil = new Date(command.expiresAt);
    gracePeriodUntil.setDate(gracePeriodUntil.getDate() + 7);
    licenseInstance.reissue(command.expiresAt, gracePeriodUntil);

    const unsignedSnapshot = EntitlementSnapshot.create({
      id: this.idGenerator.generate('ent_snap'),
      licenseInstanceId: licenseInstance.id,
      version: licenseInstance.currentVersion,
      status: licenseInstance.status,
      entitlements: command.entitlements,
      validFrom: this.clock.now(),
      validUntil: licenseInstance.expiresAt,
      gracePeriodUntil: licenseInstance.gracePeriodUntil,
      createdAt: this.clock.now(),
    });

    const signature = await this.licenseSignature.sign(unsignedSnapshot);
    const snapshot = unsignedSnapshot.withSignature(signature);

    await this.licenseInstances.save(licenseInstance);
    await this.entitlementSnapshots.save(snapshot);

    return {
      licenseInstanceId: licenseInstance.id,
      status: snapshot.status,
      version: snapshot.version,
      expiresAt: snapshot.validUntil,
      gracePeriodUntil: snapshot.gracePeriodUntil,
      entitlements: snapshot.entitlements,
      signature,
    };
  }
}
