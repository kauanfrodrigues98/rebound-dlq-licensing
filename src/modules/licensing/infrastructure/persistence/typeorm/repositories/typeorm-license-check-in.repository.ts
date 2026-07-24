import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicenseCheckInRepository } from '../../../../application/ports/license-check-in.repository';
import { LicenseCheckIn } from '../../../../domain/entities/license-check-in.entity';
import { LicenseCheckInOrmEntity } from '../entities/license-check-in.orm-entity';
import { LicenseCheckInMapper } from '../mappers/license-check-in.mapper';

@Injectable()
export class TypeOrmLicenseCheckInRepository implements LicenseCheckInRepository {
  constructor(
    @InjectRepository(LicenseCheckInOrmEntity)
    private readonly repository: Repository<LicenseCheckInOrmEntity>,
  ) {}

  async save(licenseCheckIn: LicenseCheckIn): Promise<void> {
    await this.repository.save(LicenseCheckInMapper.toOrm(licenseCheckIn));
  }
}
