export interface CheckInLicenseCommand {
  licenseToken: string;
  installationFingerprint: string;
  currentLicenseVersion?: number;
  appVersion: string;
  usage: {
    projects: number;
    users: number;
    monthlyEvents: number;
  };
}
