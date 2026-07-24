import { EntitlementSnapshot } from '../../domain/entities/entitlement-snapshot.entity';

export const LICENSE_SIGNATURE_PORT = Symbol('LICENSE_SIGNATURE_PORT');

export interface LicenseSignaturePort {
  sign(entitlementSnapshot: EntitlementSnapshot): Promise<string>;
}
