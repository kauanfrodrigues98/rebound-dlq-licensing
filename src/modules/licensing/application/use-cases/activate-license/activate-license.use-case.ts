import { Inject, Injectable } from '@nestjs/common';
import { CLOCK_PORT } from '../../../../../shared/application/ports/clock.port';
import type { ClockPort } from '../../../../../shared/application/ports/clock.port';
import { ID_GENERATOR_PORT } from '../../../../../shared/application/ports/id-generator.port';
import type { IdGeneratorPort } from '../../../../../shared/application/ports/id-generator.port';
import { EntitlementSnapshot } from '../../../domain/entities/entitlement-snapshot.entity';
import { LicenseInstance } from '../../../domain/entities/license-instance.entity';
import { LicenseToken } from '../../../domain/entities/license-token.entity';
import { ENTITLEMENT_SNAPSHOT_REPOSITORY } from '../../ports/entitlement-snapshot.repository';
import type { EntitlementSnapshotRepository } from '../../ports/entitlement-snapshot.repository';
import { INSTALLATION_FINGERPRINT_GENERATOR_PORT } from '../../ports/installation-fingerprint-generator.port';
import type { InstallationFingerprintGeneratorPort } from '../../ports/installation-fingerprint-generator.port';
import { LICENSE_INSTANCE_REPOSITORY } from '../../ports/license-instance.repository';
import type { LicenseInstanceRepository } from '../../ports/license-instance.repository';
import { LICENSE_SIGNATURE_PORT } from '../../ports/license-signature.port';
import type { LicenseSignaturePort } from '../../ports/license-signature.port';
import { LICENSE_TOKEN_HASHER_PORT } from '../../ports/license-token-hasher.port';
import type { LicenseTokenHasherPort } from '../../ports/license-token-hasher.port';
import { LICENSE_TOKEN_REPOSITORY } from '../../ports/license-token.repository';
import type { LicenseTokenRepository } from '../../ports/license-token.repository';
import { ActivateLicenseCommand } from './activate-license.command';
import { ActivateLicenseResult } from './activate-license.result';
import { LicenseKeyCodec } from '../../services/license-key-codec';

@Injectable()
export class ActivateLicenseUseCase {
  constructor(
    @Inject(LICENSE_INSTANCE_REPOSITORY)
    private readonly licenseInstances: LicenseInstanceRepository,
    @Inject(LICENSE_TOKEN_REPOSITORY)
    private readonly licenseTokens: LicenseTokenRepository,
    @Inject(ENTITLEMENT_SNAPSHOT_REPOSITORY)
    private readonly entitlementSnapshots: EntitlementSnapshotRepository,
    @Inject(LICENSE_SIGNATURE_PORT)
    private readonly licenseSignature: LicenseSignaturePort,
    @Inject(LICENSE_TOKEN_HASHER_PORT)
    private readonly tokenHasher: LicenseTokenHasherPort,
    @Inject(INSTALLATION_FINGERPRINT_GENERATOR_PORT)
    private readonly fingerprintGenerator: InstallationFingerprintGeneratorPort,
    @Inject(CLOCK_PORT)
    private readonly clock: ClockPort,
    @Inject(ID_GENERATOR_PORT)
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  async execute(
    command: ActivateLicenseCommand,
  ): Promise<ActivateLicenseResult> {
    const now = this.clock.now();
    const gracePeriodUntil = new Date(command.expiresAt);
    gracePeriodUntil.setDate(gracePeriodUntil.getDate() + 7);
    const installationFingerprint = this.fingerprintGenerator.generate();

    const licenseInstance = LicenseInstance.create({
      id: this.idGenerator.generate('lic_inst'),
      customerId: command.customerId,
      contractId: command.contractId,
      installationName: command.installationName,
      installationFingerprint,
      status: 'active',
      currentVersion: 1,
      issuedAt: now,
      expiresAt: command.expiresAt,
      gracePeriodUntil,
    });

    const unsignedSnapshot = EntitlementSnapshot.create({
      id: this.idGenerator.generate('ent_snap'),
      licenseInstanceId: licenseInstance.id,
      version: licenseInstance.currentVersion,
      status: licenseInstance.status,
      entitlements: command.entitlements,
      validFrom: now,
      validUntil: command.expiresAt,
      gracePeriodUntil,
      createdAt: now,
    });

    const signature = await this.licenseSignature.sign(unsignedSnapshot);
    const snapshot = unsignedSnapshot.withSignature(signature);
    const rawLicenseToken = this.idGenerator.generate('rbd_lic');
    const licenseKey = LicenseKeyCodec.encode({
      licenseToken: rawLicenseToken,
      installationFingerprint,
    });
    const licenseToken = LicenseToken.create({
      id: this.idGenerator.generate('lic_tok'),
      licenseInstanceId: licenseInstance.id,
      tokenHash: this.tokenHasher.hash(rawLicenseToken),
      licenseKey,
      issuedAt: now,
      expiresAt: gracePeriodUntil,
    });

    await this.licenseInstances.save(licenseInstance);
    await this.entitlementSnapshots.save(snapshot);
    await this.licenseTokens.save(licenseToken);

    return {
      licenseInstanceId: licenseInstance.id,
      licenseKey,
      licenseToken: rawLicenseToken,
      installationFingerprint,
      status: licenseInstance.status,
      version: snapshot.version,
      expiresAt: licenseInstance.expiresAt,
      gracePeriodUntil: licenseInstance.gracePeriodUntil,
      entitlements: snapshot.entitlements,
      signature,
    };
  }
}
