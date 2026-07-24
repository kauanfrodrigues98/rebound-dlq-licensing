import { LicenseToken } from '../../../../domain/entities/license-token.entity';
import { LicenseTokenOrmEntity } from '../entities/license-token.orm-entity';

export class LicenseTokenMapper {
  static toDomain(orm: LicenseTokenOrmEntity): LicenseToken {
    return LicenseToken.create({
      id: orm.id,
      licenseInstanceId: orm.licenseInstanceId,
      tokenHash: orm.tokenHash,
      issuedAt: orm.issuedAt,
      expiresAt: orm.expiresAt,
      revokedAt: orm.revokedAt ?? undefined,
    });
  }

  static toOrm(domain: LicenseToken): LicenseTokenOrmEntity {
    const orm = new LicenseTokenOrmEntity();
    orm.id = domain.id;
    orm.licenseInstanceId = domain.licenseInstanceId;
    orm.tokenHash = domain.tokenHash;
    orm.issuedAt = domain.issuedAt;
    orm.expiresAt = domain.expiresAt;
    orm.revokedAt = domain.revokedAt ?? null;

    return orm;
  }
}
