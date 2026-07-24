export const LICENSE_TOKEN_HASHER_PORT = Symbol('LICENSE_TOKEN_HASHER_PORT');

export interface LicenseTokenHasherPort {
  hash(token: string): string;
}
