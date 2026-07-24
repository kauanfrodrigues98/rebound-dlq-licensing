import { LicenseInstance } from '../../../../domain/entities/license-instance.entity';
import { LicenseInstanceOrmEntity } from '../entities/license-instance.orm-entity';

export class LicenseInstanceMapper {
  static toDomain(orm: LicenseInstanceOrmEntity): LicenseInstance {
    return LicenseInstance.create({
      id: orm.id,
      customerId: orm.customerId,
      contractId: orm.contractId,
      installationName: orm.installationName,
      installationFingerprint: orm.installationFingerprint,
      status: orm.status,
      currentVersion: orm.currentVersion,
      issuedAt: orm.issuedAt,
      expiresAt: orm.expiresAt,
      gracePeriodUntil: orm.gracePeriodUntil,
      lastCheckInAt: orm.lastCheckInAt ?? undefined,
    });
  }

  static toOrm(domain: LicenseInstance): LicenseInstanceOrmEntity {
    const orm = new LicenseInstanceOrmEntity();
    orm.id = domain.id;
    orm.customerId = domain.customerId;
    orm.contractId = domain.contractId;
    orm.installationName = domain.installationName;
    orm.installationFingerprint = domain.installationFingerprint;
    orm.status = domain.status;
    orm.currentVersion = domain.currentVersion;
    orm.issuedAt = domain.issuedAt;
    orm.expiresAt = domain.expiresAt;
    orm.gracePeriodUntil = domain.gracePeriodUntil;
    orm.lastCheckInAt = domain.lastCheckInAt ?? null;

    return orm;
  }
}
