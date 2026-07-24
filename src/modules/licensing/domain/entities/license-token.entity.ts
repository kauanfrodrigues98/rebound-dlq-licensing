export interface LicenseTokenProps {
  id: string;
  licenseInstanceId: string;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}

export class LicenseToken {
  private constructor(private readonly props: LicenseTokenProps) {}

  static create(props: LicenseTokenProps): LicenseToken {
    return new LicenseToken(props);
  }

  get id(): string {
    return this.props.id;
  }

  get licenseInstanceId(): string {
    return this.props.licenseInstanceId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get issuedAt(): Date {
    return this.props.issuedAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | undefined {
    return this.props.revokedAt;
  }

  isActive(now: Date): boolean {
    return !this.props.revokedAt && this.props.expiresAt > now;
  }
}
