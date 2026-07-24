import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { LicensingModule } from './modules/licensing/licensing.module';

const config = appConfig();

@Module({
  imports: [
    ...(config.database.enabled
      ? [TypeOrmModule.forRoot(databaseConfig())]
      : []),
    LicensingModule,
  ],
})
export class AppModule {}
