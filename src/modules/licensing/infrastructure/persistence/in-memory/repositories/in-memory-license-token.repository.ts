import { Injectable } from '@nestjs/common';
import { LicenseTokenRepository } from '../../../../application/ports/license-token.repository';
import { LicenseToken } from '../../../../domain/entities/license-token.entity';

@Injectable()
export class InMemoryLicenseTokenRepository implements LicenseTokenRepository {
  private readonly items = new Map<string, LicenseToken>();

  findByTokenHash(tokenHash: string): Promise<LicenseToken | null> {
    return Promise.resolve(this.items.get(tokenHash) ?? null);
  }

  save(licenseToken: LicenseToken): Promise<void> {
    this.items.set(licenseToken.tokenHash, licenseToken);

    return Promise.resolve();
  }
}
