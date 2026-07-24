import { LicensePlan } from '../../domain/entities/license-plan.entity';

export const LICENSE_PLAN_REPOSITORY = Symbol('LICENSE_PLAN_REPOSITORY');

export interface LicensePlanRepository {
  findAll(): Promise<LicensePlan[]>;
  findById(id: string): Promise<LicensePlan | null>;
  save(plan: LicensePlan): Promise<void>;
}
