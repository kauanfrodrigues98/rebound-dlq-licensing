export interface LicenseKeyPayload {
  licenseToken: string;
  installationFingerprint: string;
}

export class LicenseKeyCodec {
  private static readonly prefix = 'rbdlic_';

  static encode(payload: LicenseKeyPayload): string {
    const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString(
      'base64url',
    );

    return `${this.prefix}${encoded}`;
  }

  static decode(licenseKey: string): LicenseKeyPayload {
    if (!licenseKey.startsWith(this.prefix)) {
      throw new Error('Invalid license key prefix.');
    }

    const encoded = licenseKey.slice(this.prefix.length);
    const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
    const payload = JSON.parse(decoded) as LicenseKeyPayload;

    if (!payload.licenseToken || !payload.installationFingerprint) {
      throw new Error('Invalid license key payload.');
    }

    return payload;
  }
}
