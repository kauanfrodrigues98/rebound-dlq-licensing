import { LicenseCheckIn } from '../../domain/entities/license-check-in.entity';

export const LICENSE_CHECK_IN_REPOSITORY = Symbol(
  'LICENSE_CHECK_IN_REPOSITORY',
);

export interface LicenseCheckInRepository {
  save(licenseCheckIn: LicenseCheckIn): Promise<void>;
}
