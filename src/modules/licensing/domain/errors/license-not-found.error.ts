import { DomainError } from '../../../../shared/domain/errors/domain-error';

export class LicenseNotFoundError extends DomainError {
  constructor(licenseInstanceId: string) {
    super(`License instance ${licenseInstanceId} was not found.`);
  }
}
