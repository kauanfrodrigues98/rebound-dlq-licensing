import { Injectable } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { appConfig } from '../../../../config/app.config';
import { LicenseTokenHasherPort } from '../../application/ports/license-token-hasher.port';

@Injectable()
export class HmacLicenseTokenHasherAdapter implements LicenseTokenHasherPort {
  hash(token: string): string {
    return createHmac('sha256', appConfig().licenseTokenHashSecret)
      .update(token)
      .digest('hex');
  }
}
