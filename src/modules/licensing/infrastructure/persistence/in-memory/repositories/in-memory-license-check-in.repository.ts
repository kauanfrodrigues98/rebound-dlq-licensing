import { Injectable } from '@nestjs/common';
import { LicenseCheckInRepository } from '../../../../application/ports/license-check-in.repository';
import { LicenseCheckIn } from '../../../../domain/entities/license-check-in.entity';

@Injectable()
export class InMemoryLicenseCheckInRepository implements LicenseCheckInRepository {
  private readonly items: LicenseCheckIn[] = [];

  save(licenseCheckIn: LicenseCheckIn): Promise<void> {
    this.items.push(licenseCheckIn);

    return Promise.resolve();
  }
}
