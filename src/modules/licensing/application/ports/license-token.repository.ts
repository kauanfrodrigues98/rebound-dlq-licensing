import { LicenseToken } from '../../domain/entities/license-token.entity';

export const LICENSE_TOKEN_REPOSITORY = Symbol('LICENSE_TOKEN_REPOSITORY');

export interface LicenseTokenRepository {
  findByTokenHash(tokenHash: string): Promise<LicenseToken | null>;
  save(licenseToken: LicenseToken): Promise<void>;
}
