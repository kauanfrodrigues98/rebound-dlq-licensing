import { DomainError } from '../../../../shared/domain/errors/domain-error';

export class InstallationFingerprintMismatchError extends DomainError {
  constructor() {
    super('Installation fingerprint does not match the license instance.');
  }
}
