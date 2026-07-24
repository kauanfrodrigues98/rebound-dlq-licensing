import { Injectable } from '@nestjs/common';
import { LicenseInstanceRepository } from '../../../../application/ports/license-instance.repository';
import { LicenseInstance } from '../../../../domain/entities/license-instance.entity';

@Injectable()
export class InMemoryLicenseInstanceRepository implements LicenseInstanceRepository {
  private readonly items = new Map<string, LicenseInstance>();

  findById(id: string): Promise<LicenseInstance | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  findAll(): Promise<LicenseInstance[]> {
    const licenses = [...this.items.values()].sort(
      (left, right) => right.issuedAt.getTime() - left.issuedAt.getTime(),
    );

    return Promise.resolve(licenses);
  }

  save(licenseInstance: LicenseInstance): Promise<void> {
    this.items.set(licenseInstance.id, licenseInstance);

    return Promise.resolve();
  }
}
