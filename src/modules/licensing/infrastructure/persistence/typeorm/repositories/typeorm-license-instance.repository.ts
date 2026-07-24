import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicenseInstanceRepository } from '../../../../application/ports/license-instance.repository';
import { LicenseInstance } from '../../../../domain/entities/license-instance.entity';
import { LicenseInstanceOrmEntity } from '../entities/license-instance.orm-entity';
import { LicenseInstanceMapper } from '../mappers/license-instance.mapper';

@Injectable()
export class TypeOrmLicenseInstanceRepository implements LicenseInstanceRepository {
  constructor(
    @InjectRepository(LicenseInstanceOrmEntity)
    private readonly repository: Repository<LicenseInstanceOrmEntity>,
  ) {}

  async findById(id: string): Promise<LicenseInstance | null> {
    const orm = await this.repository.findOne({ where: { id } });

    return orm ? LicenseInstanceMapper.toDomain(orm) : null;
  }

  async findAll(): Promise<LicenseInstance[]> {
    const licenses = await this.repository.find({
      order: { issuedAt: 'DESC' },
    });

    return licenses.map((license) => LicenseInstanceMapper.toDomain(license));
  }

  async save(licenseInstance: LicenseInstance): Promise<void> {
    await this.repository.save(LicenseInstanceMapper.toOrm(licenseInstance));
  }
}
