import { DomainError } from '../../../../shared/domain/errors/domain-error';

export class InvalidLicenseTokenError extends DomainError {
  constructor() {
    super('Invalid license token.');
  }
}
