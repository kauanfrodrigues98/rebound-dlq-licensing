import { Injectable } from '@nestjs/common';
import { EntitlementSnapshotRepository } from '../../../../application/ports/entitlement-snapshot.repository';
import { EntitlementSnapshot } from '../../../../domain/entities/entitlement-snapshot.entity';

@Injectable()
export class InMemoryEntitlementSnapshotRepository implements EntitlementSnapshotRepository {
  private readonly items = new Map<string, EntitlementSnapshot[]>();

  findLatestByLicenseInstanceId(
    licenseInstanceId: string,
  ): Promise<EntitlementSnapshot | null> {
    const snapshots = this.items.get(licenseInstanceId) ?? [];

    return Promise.resolve(snapshots.at(-1) ?? null);
  }

  save(entitlementSnapshot: EntitlementSnapshot): Promise<void> {
    const snapshots =
      this.items.get(entitlementSnapshot.licenseInstanceId) ?? [];
    snapshots.push(entitlementSnapshot);
    this.items.set(entitlementSnapshot.licenseInstanceId, snapshots);

    return Promise.resolve();
  }
}
