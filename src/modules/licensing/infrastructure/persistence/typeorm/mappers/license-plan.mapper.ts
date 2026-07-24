import { LicensePlan } from '../../../../domain/entities/license-plan.entity';
import { LicensePlanOrmEntity } from '../entities/license-plan.orm-entity';

export class LicensePlanMapper {
  static toDomain(orm: LicensePlanOrmEntity): LicensePlan {
    return LicensePlan.create({
      id: orm.id,
      name: orm.name,
      description: orm.description,
      cadence: orm.cadence,
      featured: orm.featured,
      priceLabel: orm.priceLabel,
      entitlements: orm.entitlements,
      active: orm.active,
      sortOrder: orm.sortOrder,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: LicensePlan): LicensePlanOrmEntity {
    const orm = new LicensePlanOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.cadence = domain.cadence;
    orm.featured = domain.featured;
    orm.priceLabel = domain.priceLabel;
    orm.entitlements = domain.entitlements;
    orm.active = domain.active;
    orm.sortOrder = domain.sortOrder;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;

    return orm;
  }
}
