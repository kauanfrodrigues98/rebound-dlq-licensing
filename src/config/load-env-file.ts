import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const loadEnvFile = (
  filePath = resolve(process.cwd(), '.env'),
): void => {
  if (!existsSync(filePath)) {
    return;
  }

  const file = readFileSync(filePath, 'utf8');

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, '');

    process.env[key] ??= value;
  }
};
