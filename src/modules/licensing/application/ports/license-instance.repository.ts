import { LicenseInstance } from '../../domain/entities/license-instance.entity';

export const LICENSE_INSTANCE_REPOSITORY = Symbol(
  'LICENSE_INSTANCE_REPOSITORY',
);

export interface LicenseInstanceRepository {
  findById(id: string): Promise<LicenseInstance | null>;
  findAll(): Promise<LicenseInstance[]>;
  save(licenseInstance: LicenseInstance): Promise<void>;
}
