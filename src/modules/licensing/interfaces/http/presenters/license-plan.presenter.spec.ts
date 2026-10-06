import { LicensePlanPresenter } from './license-plan.presenter';
import type { LicensePlanCatalogItem } from '../../../application/services/license-plan-catalog.service';
describe('License plan deployment response',()=>{
 it.each(['cloud','self_hosted'] as const)('preserves the %s environment in the HTTP catalog',deployment=>{
  const item={id:'example',deployment,createdAt:new Date(),updatedAt:new Date()} as LicensePlanCatalogItem;
  expect(LicensePlanPresenter.toHttp(item).deployment).toBe(deployment);
 });
});
