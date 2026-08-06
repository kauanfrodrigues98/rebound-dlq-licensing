import { LicenseStatus } from '../value-objects/license-status.vo';

export interface LicenseInstanceProps {
  id: string;
  customerId: string;
  contractId: string;
  installationName: string;
  installationFingerprint: string;
  status: LicenseStatus;
  currentVersion: number;
  issuedAt: Date;
  expiresAt: Date;
  gracePeriodUntil: Date;
  lastCheckInAt?: Date;
}

export class LicenseInstance {
  private constructor(private readonly props: LicenseInstanceProps) {}

  static create(props: LicenseInstanceProps): LicenseInstance {
    return new LicenseInstance(props);
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get contractId(): string {
    return this.props.contractId;
  }

  get installationName(): string {
    return this.props.installationName;
  }

  get installationFingerprint(): string {
    return this.props.installationFingerprint;
  }

  get status(): LicenseStatus {
    return this.props.status;
  }

  get currentVersion(): number {
    return this.props.currentVersion;
  }

  get issuedAt(): Date {
    return this.props.issuedAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get gracePeriodUntil(): Date {
    return this.props.gracePeriodUntil;
  }

  get lastCheckInAt(): Date | undefined {
    return this.props.lastCheckInAt;
  }

  matchesFingerprint(fingerprint: string): boolean {
    return this.props.installationFingerprint === fingerprint;
  }

  registerCheckIn(checkedAt: Date): void {
    this.props.lastCheckInAt = checkedAt;
  }

  reissue(expiresAt: Date, gracePeriodUntil: Date): void {
    this.props.currentVersion += 1;
    this.props.expiresAt = expiresAt;
    this.props.gracePeriodUntil = gracePeriodUntil;
    this.props.status = 'active';
  }

  suspend(): void {
    this.props.status = 'suspended';
    this.props.currentVersion += 1;
  }

  revoke(): void {
    this.props.status = 'revoked';
    this.props.currentVersion += 1;
  }
}
