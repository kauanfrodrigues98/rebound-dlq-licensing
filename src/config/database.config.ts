import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { appConfig } from './app.config';
import { EntitlementSnapshotOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/entitlement-snapshot.orm-entity';
import { LicenseCheckInOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/license-check-in.orm-entity';
import { LicenseInstanceOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/license-instance.orm-entity';
import { LicensePlanOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/license-plan.orm-entity';
import { LicenseTokenOrmEntity } from '../modules/licensing/infrastructure/persistence/typeorm/entities/license-token.orm-entity';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const config = appConfig();

  return {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    ssl: config.database.ssl ? { rejectUnauthorized: true } : false,
    synchronize: config.database.synchronize,
    autoLoadEntities: false,
    entities: [
      LicenseInstanceOrmEntity,
      LicensePlanOrmEntity,
      LicenseTokenOrmEntity,
      EntitlementSnapshotOrmEntity,
      LicenseCheckInOrmEntity,
    ],
  };
};
