import { DataSource, DataSourceOptions } from 'typeorm';
import { appConfig } from './app.config';
import { InitialLicensingSchema1721433600000 } from '../migrations/1721433600000-InitialLicensingSchema';
import { CreateLicensePlans1777100000000 } from '../migrations/1777100000000-CreateLicensePlans';
import { AddLicenseKeyToLicenseTokens1777200000000 } from '../migrations/1777200000000-AddLicenseKeyToLicenseTokens';
import { EntitlementSnapshotOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/entitlement-snapshot.orm-entity';
import { LicenseCheckInOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/license-check-in.orm-entity';
import { LicenseInstanceOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/license-instance.orm-entity';
import { LicensePlanOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/license-plan.orm-entity';
import { LicenseTokenOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/license-token.orm-entity';

const config = appConfig();

const options = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  ssl: config.database.ssl ? { rejectUnauthorized: true } : false,
  synchronize: false,
  entities: [
    LicenseInstanceOrmEntity,
    LicensePlanOrmEntity,
    LicenseTokenOrmEntity,
    EntitlementSnapshotOrmEntity,
    LicenseCheckInOrmEntity,
  ],
  migrations: [
    InitialLicensingSchema1721433600000,
    CreateLicensePlans1777100000000,
    AddLicenseKeyToLicenseTokens1777200000000,
  ],
  migrationsTableName: 'typeorm_migrations',
} satisfies DataSourceOptions;

export default new DataSource(options);
