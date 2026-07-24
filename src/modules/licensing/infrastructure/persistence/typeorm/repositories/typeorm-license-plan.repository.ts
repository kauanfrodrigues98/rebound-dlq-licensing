import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicensePlanRepository } from '../../../../application/ports/license-plan.repository';
import { LicensePlan } from '../../../../domain/entities/license-plan.entity';
import { LicensePlanOrmEntity } from '../entities/license-plan.orm-entity';
import { LicensePlanMapper } from '../mappers/license-plan.mapper';

@Injectable()
export class TypeOrmLicensePlanRepository implements LicensePlanRepository {
  constructor(
    @InjectRepository(LicensePlanOrmEntity)
    private readonly repository: Repository<LicensePlanOrmEntity>,
  ) {}

  async findAll(): Promise<LicensePlan[]> {
    const plans = await this.repository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return plans.map((plan) => LicensePlanMapper.toDomain(plan));
  }

  async findById(id: string): Promise<LicensePlan | null> {
    const plan = await this.repository.findOne({ where: { id } });

    return plan ? LicensePlanMapper.toDomain(plan) : null;
  }

  async save(plan: LicensePlan): Promise<void> {
    await this.repository.save(LicensePlanMapper.toOrm(plan));
  }
}
