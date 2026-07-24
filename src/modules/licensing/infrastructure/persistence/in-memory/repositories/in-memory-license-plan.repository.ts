import { Injectable } from '@nestjs/common';
import { LicensePlanRepository } from '../../../../application/ports/license-plan.repository';
import { LicensePlan } from '../../../../domain/entities/license-plan.entity';

@Injectable()
export class InMemoryLicensePlanRepository implements LicensePlanRepository {
  private readonly items = new Map<string, LicensePlan>();

  findAll(): Promise<LicensePlan[]> {
    const plans = [...this.items.values()].sort((left, right) => {
      const orderDelta = left.sortOrder - right.sortOrder;

      return orderDelta === 0 ? left.name.localeCompare(right.name) : orderDelta;
    });

    return Promise.resolve(plans);
  }

  findById(id: string): Promise<LicensePlan | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  save(plan: LicensePlan): Promise<void> {
    this.items.set(plan.id, plan);

    return Promise.resolve();
  }
}
