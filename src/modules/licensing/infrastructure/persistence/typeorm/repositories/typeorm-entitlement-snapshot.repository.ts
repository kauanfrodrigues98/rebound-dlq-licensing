import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntitlementSnapshotRepository } from '../../../../application/ports/entitlement-snapshot.repository';
import { EntitlementSnapshot } from '../../../../domain/entities/entitlement-snapshot.entity';
import { EntitlementSnapshotOrmEntity } from '../entities/entitlement-snapshot.orm-entity';
import { EntitlementSnapshotMapper } from '../mappers/entitlement-snapshot.mapper';

@Injectable()
export class TypeOrmEntitlementSnapshotRepository implements EntitlementSnapshotRepository {
  constructor(
    @InjectRepository(EntitlementSnapshotOrmEntity)
    private readonly repository: Repository<EntitlementSnapshotOrmEntity>,
  ) {}

  async findLatestByLicenseInstanceId(
    licenseInstanceId: string,
  ): Promise<EntitlementSnapshot | null> {
    const orm = await this.repository.findOne({
      where: { licenseInstanceId },
      order: { version: 'DESC' },
    });

    return orm ? EntitlementSnapshotMapper.toDomain(orm) : null;
  }

  async save(entitlementSnapshot: EntitlementSnapshot): Promise<void> {
    await this.repository.save(
      EntitlementSnapshotMapper.toOrm(entitlementSnapshot),
    );
  }
}
