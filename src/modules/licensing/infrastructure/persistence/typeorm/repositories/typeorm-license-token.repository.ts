import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicenseTokenRepository } from '../../../../application/ports/license-token.repository';
import { LicenseToken } from '../../../../domain/entities/license-token.entity';
import { LicenseTokenOrmEntity } from '../entities/license-token.orm-entity';
import { LicenseTokenMapper } from '../mappers/license-token.mapper';

@Injectable()
export class TypeOrmLicenseTokenRepository implements LicenseTokenRepository {
  constructor(
    @InjectRepository(LicenseTokenOrmEntity)
    private readonly repository: Repository<LicenseTokenOrmEntity>,
  ) {}

  async findByTokenHash(tokenHash: string): Promise<LicenseToken | null> {
    const orm = await this.repository.findOne({ where: { tokenHash } });

    return orm ? LicenseTokenMapper.toDomain(orm) : null;
  }

  async findLatestByLicenseInstanceId(
    licenseInstanceId: string,
  ): Promise<LicenseToken | null> {
    const orm = await this.repository.findOne({
      where: { licenseInstanceId },
      order: { issuedAt: 'DESC' },
    });

    return orm ? LicenseTokenMapper.toDomain(orm) : null;
  }

  async save(licenseToken: LicenseToken): Promise<void> {
    await this.repository.save(LicenseTokenMapper.toOrm(licenseToken));
  }
}
