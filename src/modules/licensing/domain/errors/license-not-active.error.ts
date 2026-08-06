import { DomainError } from '../../../../shared/domain/errors/domain-error';

export class LicenseNotActiveError extends DomainError {
  constructor(status: string) {
    super(`License is not active. Current status: ${status}.`);
  }
}
