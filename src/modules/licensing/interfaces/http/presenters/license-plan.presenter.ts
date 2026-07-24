import { LicensePlanCatalogItem } from '../../../application/services/license-plan-catalog.service';

export class LicensePlanPresenter {
  static toHttp(plan: LicensePlanCatalogItem) {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      cadence: plan.cadence,
      featured: plan.featured,
      priceLabel: plan.priceLabel,
      entitlements: plan.entitlements,
      active: plan.active,
      sortOrder: plan.sortOrder,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }
}
