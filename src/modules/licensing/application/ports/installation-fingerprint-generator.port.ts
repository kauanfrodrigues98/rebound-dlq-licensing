export const INSTALLATION_FINGERPRINT_GENERATOR_PORT = Symbol(
  'INSTALLATION_FINGERPRINT_GENERATOR_PORT',
);

export interface InstallationFingerprintGeneratorPort {
  generate(): string;
}
