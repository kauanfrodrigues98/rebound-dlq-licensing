import { EntitlementSnapshot } from '../../domain/entities/entitlement-snapshot.entity';

export const ENTITLEMENT_SNAPSHOT_REPOSITORY = Symbol(
  'ENTITLEMENT_SNAPSHOT_REPOSITORY',
);

export interface EntitlementSnapshotRepository {
  findLatestByLicenseInstanceId(
    licenseInstanceId: string,
  ): Promise<EntitlementSnapshot | null>;
  save(entitlementSnapshot: EntitlementSnapshot): Promise<void>;
}
