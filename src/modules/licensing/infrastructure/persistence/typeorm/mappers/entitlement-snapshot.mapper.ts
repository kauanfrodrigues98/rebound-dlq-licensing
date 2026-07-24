import { EntitlementSnapshot } from '../../../../domain/entities/entitlement-snapshot.entity';
import { EntitlementSnapshotOrmEntity } from '../entities/entitlement-snapshot.orm-entity';

export class EntitlementSnapshotMapper {
  static toDomain(orm: EntitlementSnapshotOrmEntity): EntitlementSnapshot {
    return EntitlementSnapshot.create({
      id: orm.id,
      licenseInstanceId: orm.licenseInstanceId,
      version: orm.version,
      status: orm.status,
      entitlements: orm.entitlements,
      validFrom: orm.validFrom,
      validUntil: orm.validUntil,
      gracePeriodUntil: orm.gracePeriodUntil,
      signature: orm.signature,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: EntitlementSnapshot): EntitlementSnapshotOrmEntity {
    if (!domain.signature) {
      throw new Error('Cannot persist an unsigned entitlement snapshot.');
    }

    const orm = new EntitlementSnapshotOrmEntity();
    orm.id = domain.id;
    orm.licenseInstanceId = domain.licenseInstanceId;
    orm.version = domain.version;
    orm.status = domain.status;
    orm.entitlements = domain.entitlements;
    orm.validFrom = domain.validFrom;
    orm.validUntil = domain.validUntil;
    orm.gracePeriodUntil = domain.gracePeriodUntil;
    orm.signature = domain.signature;
    orm.createdAt = domain.createdAt;

    return orm;
  }
}
