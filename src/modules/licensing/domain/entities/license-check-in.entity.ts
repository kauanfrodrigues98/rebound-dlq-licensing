export interface LicenseCheckInProps {
  id: string;
  licenseInstanceId: string;
  appVersion: string;
  currentLicenseVersion?: number;
  usage: {
    projects: number;
    users: number;
    monthlyEvents: number;
  };
  checkedAt: Date;
}

export class LicenseCheckIn {
  private constructor(private readonly props: LicenseCheckInProps) {}

  static create(props: LicenseCheckInProps): LicenseCheckIn {
    return new LicenseCheckIn(props);
  }

  get id(): string {
    return this.props.id;
  }

  get licenseInstanceId(): string {
    return this.props.licenseInstanceId;
  }

  get appVersion(): string {
    return this.props.appVersion;
  }

  get currentLicenseVersion(): number | undefined {
    return this.props.currentLicenseVersion;
  }

  get usage(): LicenseCheckInProps['usage'] {
    return this.props.usage;
  }

  get checkedAt(): Date {
    return this.props.checkedAt;
  }
}
