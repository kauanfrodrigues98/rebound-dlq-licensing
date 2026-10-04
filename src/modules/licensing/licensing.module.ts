import { FinancialLifecycleService } from './application/services/financial-lifecycle.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from '../../config/app.config';
import { CLOCK_PORT } from '../../shared/application/ports/clock.port';
import { ID_GENERATOR_PORT } from '../../shared/application/ports/id-generator.port';
import { NodeIdGeneratorAdapter } from '../../shared/infrastructure/crypto/node-id-generator.adapter';
import { SystemClockAdapter } from '../../shared/infrastructure/clock/system-clock.adapter';
import { ActivateLicenseUseCase } from './application/use-cases/activate-license/activate-license.use-case';
import { CheckInLicenseUseCase } from './application/use-cases/check-in-license/check-in-license.use-case';
import { GetActiveContractLicenseUseCase } from './application/use-cases/get-active-contract-license/get-active-contract-license.use-case';
import { GetCurrentLicenseUseCase } from './application/use-cases/get-current-license/get-current-license.use-case';
import { ListLicensesUseCase } from './application/use-cases/list-licenses/list-licenses.use-case';
import { ReissueLicenseUseCase } from './application/use-cases/reissue-license/reissue-license.use-case';
import { RevokeContractLicensesUseCase } from './application/use-cases/revoke-contract-licenses/revoke-contract-licenses.use-case';
import { LicensePlanCatalogService } from './application/services/license-plan-catalog.service';
import { ENTITLEMENT_SNAPSHOT_REPOSITORY } from './application/ports/entitlement-snapshot.repository';
import { INSTALLATION_FINGERPRINT_GENERATOR_PORT } from './application/ports/installation-fingerprint-generator.port';
import { LICENSE_CHECK_IN_REPOSITORY } from './application/ports/license-check-in.repository';
import { LICENSE_INSTANCE_REPOSITORY } from './application/ports/license-instance.repository';
import { LICENSE_PLAN_REPOSITORY } from './application/ports/license-plan.repository';
import { LICENSE_SIGNATURE_PORT } from './application/ports/license-signature.port';
import { LICENSE_TOKEN_HASHER_PORT } from './application/ports/license-token-hasher.port';
import { LICENSE_TOKEN_REPOSITORY } from './application/ports/license-token.repository';
import { HmacLicenseSignatureAdapter } from './infrastructure/crypto/hmac-license-signature.adapter';
import { HmacLicenseTokenHasherAdapter } from './infrastructure/crypto/hmac-license-token-hasher.adapter';
import { Sha256InstallationFingerprintGeneratorAdapter } from './infrastructure/crypto/sha256-installation-fingerprint-generator.adapter';
import { EntitlementSnapshotOrmEntity } from './infrastructure/persistence/typeorm/entities/entitlement-snapshot.orm-entity';
import { LicenseCheckInOrmEntity } from './infrastructure/persistence/typeorm/entities/license-check-in.orm-entity';
import { LicenseInstanceOrmEntity } from './infrastructure/persistence/typeorm/entities/license-instance.orm-entity';
import { LicensePlanOrmEntity } from './infrastructure/persistence/typeorm/entities/license-plan.orm-entity';
import { LicenseTokenOrmEntity } from './infrastructure/persistence/typeorm/entities/license-token.orm-entity';
import { InMemoryEntitlementSnapshotRepository } from './infrastructure/persistence/in-memory/repositories/in-memory-entitlement-snapshot.repository';
import { InMemoryLicenseCheckInRepository } from './infrastructure/persistence/in-memory/repositories/in-memory-license-check-in.repository';
import { InMemoryLicenseInstanceRepository } from './infrastructure/persistence/in-memory/repositories/in-memory-license-instance.repository';
import { InMemoryLicensePlanRepository } from './infrastructure/persistence/in-memory/repositories/in-memory-license-plan.repository';
import { InMemoryLicenseTokenRepository } from './infrastructure/persistence/in-memory/repositories/in-memory-license-token.repository';
import { TypeOrmEntitlementSnapshotRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-entitlement-snapshot.repository';
import { TypeOrmLicenseCheckInRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-license-check-in.repository';
import { TypeOrmLicenseInstanceRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-license-instance.repository';
import { TypeOrmLicensePlanRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-license-plan.repository';
import { TypeOrmLicenseTokenRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-license-token.repository';
import { LicenseAdminController } from './interfaces/http/controllers/license-admin.controller';
import { LicensePublicController } from './interfaces/http/controllers/license-public.controller';
import { AdminApiKeyGuard } from './interfaces/http/guards/admin-api-key.guard';

const config = appConfig();
const licensePersistenceAdapters = config.database.enabled
  ? {
      licenseInstances: TypeOrmLicenseInstanceRepository,
      licenseTokens: TypeOrmLicenseTokenRepository,
      entitlementSnapshots: TypeOrmEntitlementSnapshotRepository,
      licenseCheckIns: TypeOrmLicenseCheckInRepository,
      licensePlans: TypeOrmLicensePlanRepository,
    }
  : {
      licenseInstances: InMemoryLicenseInstanceRepository,
      licenseTokens: InMemoryLicenseTokenRepository,
      entitlementSnapshots: InMemoryEntitlementSnapshotRepository,
      licenseCheckIns: InMemoryLicenseCheckInRepository,
      licensePlans: InMemoryLicensePlanRepository,
    };

@Module({
  imports: [
    ...(config.database.enabled
      ? [
          TypeOrmModule.forFeature([
            LicenseInstanceOrmEntity,
            LicensePlanOrmEntity,
            LicenseTokenOrmEntity,
            EntitlementSnapshotOrmEntity,
            LicenseCheckInOrmEntity,
          ]),
        ]
      : []),
  ],
  controllers: [LicensePublicController, LicenseAdminController],
  providers: [
    FinancialLifecycleService,
    ActivateLicenseUseCase,
    CheckInLicenseUseCase,
    GetActiveContractLicenseUseCase,
    GetCurrentLicenseUseCase,
    LicensePlanCatalogService,
    ListLicensesUseCase,
    ReissueLicenseUseCase,
    RevokeContractLicensesUseCase,
    AdminApiKeyGuard,
    {
      provide: CLOCK_PORT,
      useClass: SystemClockAdapter,
    },
    {
      provide: ID_GENERATOR_PORT,
      useClass: NodeIdGeneratorAdapter,
    },
    {
      provide: LICENSE_INSTANCE_REPOSITORY,
      useClass: licensePersistenceAdapters.licenseInstances,
    },
    {
      provide: LICENSE_TOKEN_REPOSITORY,
      useClass: licensePersistenceAdapters.licenseTokens,
    },
    {
      provide: ENTITLEMENT_SNAPSHOT_REPOSITORY,
      useClass: licensePersistenceAdapters.entitlementSnapshots,
    },
    {
      provide: LICENSE_CHECK_IN_REPOSITORY,
      useClass: licensePersistenceAdapters.licenseCheckIns,
    },
    {
      provide: LICENSE_PLAN_REPOSITORY,
      useClass: licensePersistenceAdapters.licensePlans,
    },
    {
      provide: LICENSE_SIGNATURE_PORT,
      useClass: HmacLicenseSignatureAdapter,
    },
    {
      provide: LICENSE_TOKEN_HASHER_PORT,
      useClass: HmacLicenseTokenHasherAdapter,
    },
    {
      provide: INSTALLATION_FINGERPRINT_GENERATOR_PORT,
      useClass: Sha256InstallationFingerprintGeneratorAdapter,
    },
  ],
})
export class LicensingModule {}
