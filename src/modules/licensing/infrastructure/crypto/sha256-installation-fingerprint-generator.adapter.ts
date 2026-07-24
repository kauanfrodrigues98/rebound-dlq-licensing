import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { InstallationFingerprintGeneratorPort } from '../../application/ports/installation-fingerprint-generator.port';

@Injectable()
export class Sha256InstallationFingerprintGeneratorAdapter implements InstallationFingerprintGeneratorPort {
  generate(): string {
    const secret = randomBytes(32).toString('base64url');
    const fingerprint = createHash('sha256')
      .update(`rebound-dlq-installation:${secret}`)
      .digest('hex');

    return `fp_${fingerprint}`;
  }
}
