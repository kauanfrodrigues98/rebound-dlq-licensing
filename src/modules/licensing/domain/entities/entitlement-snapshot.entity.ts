import { LicenseStatus } from '../value-objects/license-status.vo';

export type EntitlementValue = boolean | number | string;

export interface EntitlementSnapshotProps {
  id: string;
  licenseInstanceId: string;
  version: number;
  status: LicenseStatus;
  entitlements: Record<string, EntitlementValue>;
  validFrom: Date;
  validUntil: Date;
  gracePeriodUntil: Date;
  signature?: string;
  createdAt: Date;
}

export class EntitlementSnapshot {
  private constructor(private readonly props: EntitlementSnapshotProps) {}

  static create(props: EntitlementSnapshotProps): EntitlementSnapshot {
    return new EntitlementSnapshot(props);
  }

  get id(): string {
    return this.props.id;
  }

  get licenseInstanceId(): string {
    return this.props.licenseInstanceId;
  }

  get version(): number {
    return this.props.version;
  }

  get status(): LicenseStatus {
    return this.props.status;
  }

  get entitlements(): Record<string, EntitlementValue> {
    return this.props.entitlements;
  }

  get validFrom(): Date {
    return this.props.validFrom;
  }

  get validUntil(): Date {
    return this.props.validUntil;
  }

  get gracePeriodUntil(): Date {
    return this.props.gracePeriodUntil;
  }

  get signature(): string | undefined {
    return this.props.signature;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  withSignature(signature: string): EntitlementSnapshot {
    return EntitlementSnapshot.create({
      ...this.props,
      signature,
    });
  }
}
