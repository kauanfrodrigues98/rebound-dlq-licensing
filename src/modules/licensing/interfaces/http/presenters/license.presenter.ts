export interface LicenseResponse {
  licenseInstanceId: string;
  status: string;
  version: number;
  expiresAt: string;
  gracePeriodUntil: string;
  entitlements: Record<string, boolean | number | string>;
  signature: string;
}

export interface LicenseListItemResponse {
  licenseInstanceId: string;
  customerId: string;
  contractId: string;
  installationName: string;
  installationFingerprint: string;
  status: string;
  version: number;
  issuedAt: string;
  expiresAt: string;
  gracePeriodUntil: string;
  lastCheckInAt?: string;
}

export class LicensePresenter {
  static toHttp(result: {
    licenseInstanceId: string;
    status: string;
    version: number;
    expiresAt: Date;
    gracePeriodUntil: Date;
    entitlements: Record<string, boolean | number | string>;
    signature: string;
  }): LicenseResponse {
    return {
      licenseInstanceId: result.licenseInstanceId,
      status: result.status,
      version: result.version,
      expiresAt: result.expiresAt.toISOString(),
      gracePeriodUntil: result.gracePeriodUntil.toISOString(),
      entitlements: result.entitlements,
      signature: result.signature,
    };
  }

  static listItemToHttp(result: {
    licenseInstanceId: string;
    customerId: string;
    contractId: string;
    installationName: string;
    installationFingerprint: string;
    status: string;
    version: number;
    issuedAt: Date;
    expiresAt: Date;
    gracePeriodUntil: Date;
    lastCheckInAt?: Date;
  }): LicenseListItemResponse {
    return {
      licenseInstanceId: result.licenseInstanceId,
      customerId: result.customerId,
      contractId: result.contractId,
      installationName: result.installationName,
      installationFingerprint: result.installationFingerprint,
      status: result.status,
      version: result.version,
      issuedAt: result.issuedAt.toISOString(),
      expiresAt: result.expiresAt.toISOString(),
      gracePeriodUntil: result.gracePeriodUntil.toISOString(),
      lastCheckInAt: result.lastCheckInAt?.toISOString(),
    };
  }
}
