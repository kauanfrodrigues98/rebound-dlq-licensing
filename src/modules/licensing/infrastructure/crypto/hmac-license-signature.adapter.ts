import { Injectable } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { appConfig } from '../../../../config/app.config';
import { EntitlementSnapshot } from '../../domain/entities/entitlement-snapshot.entity';
import { LicenseSignaturePort } from '../../application/ports/license-signature.port';

@Injectable()
export class HmacLicenseSignatureAdapter implements LicenseSignaturePort {
  sign(entitlementSnapshot: EntitlementSnapshot): Promise<string> {
    const payload = JSON.stringify({
      licenseInstanceId: entitlementSnapshot.licenseInstanceId,
      version: entitlementSnapshot.version,
      status: entitlementSnapshot.status,
      entitlements: entitlementSnapshot.entitlements,
      validFrom: entitlementSnapshot.validFrom.toISOString(),
      validUntil: entitlementSnapshot.validUntil.toISOString(),
      gracePeriodUntil: entitlementSnapshot.gracePeriodUntil.toISOString(),
    });

    const signature = createHmac('sha256', appConfig().licenseSigningSecret)
      .update(payload)
      .digest('hex');

    return Promise.resolve(signature);
  }
}
