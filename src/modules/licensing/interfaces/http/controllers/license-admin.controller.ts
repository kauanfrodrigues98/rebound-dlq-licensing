import { FinancialLifecycleService } from '../../../application/services/financial-lifecycle.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../../../../shared/interfaces/http/pipes/zod-validation.pipe';
import { ActivateLicenseUseCase } from '../../../application/use-cases/activate-license/activate-license.use-case';
import { GetActiveContractLicenseUseCase } from '../../../application/use-cases/get-active-contract-license/get-active-contract-license.use-case';
import { ListLicensesUseCase } from '../../../application/use-cases/list-licenses/list-licenses.use-case';
import { ReissueLicenseUseCase } from '../../../application/use-cases/reissue-license/reissue-license.use-case';
import { RevokeContractLicensesUseCase } from '../../../application/use-cases/revoke-contract-licenses/revoke-contract-licenses.use-case';
import { LicensePlanCatalogService } from '../../../application/services/license-plan-catalog.service';
import { activateLicenseRequestSchema } from '../dto/activate-license.request.dto';
import type { ActivateLicenseRequestDto } from '../dto/activate-license.request.dto';
import { licenseInstanceParamsSchema } from '../dto/license-params.dto';
import type { LicenseInstanceParamsDto } from '../dto/license-params.dto';
import { licensePlanRequestSchema } from '../dto/license-plan.request.dto';
import type { LicensePlanRequestDto } from '../dto/license-plan.request.dto';
import { reissueLicenseRequestSchema } from '../dto/reissue-license.request.dto';
import type { ReissueLicenseRequestDto } from '../dto/reissue-license.request.dto';
import { AdminApiKeyGuard } from '../guards/admin-api-key.guard';
import { LicensePlanPresenter } from '../presenters/license-plan.presenter';
import { LicensePresenter } from '../presenters/license.presenter';

@UseGuards(AdminApiKeyGuard)
@Controller('admin/licenses')
export class LicenseAdminController {
  constructor(
    private readonly financialLifecycle: FinancialLifecycleService,
    private readonly activateLicense: ActivateLicenseUseCase,
    private readonly getActiveContractLicense: GetActiveContractLicenseUseCase,
    private readonly listLicenses: ListLicensesUseCase,
    private readonly reissueLicense: ReissueLicenseUseCase,
    private readonly revokeContractLicenses: RevokeContractLicensesUseCase,
    private readonly planCatalog: LicensePlanCatalogService,
  ) {}

  @Post('contracts/:contractId/financial-state') financialState(
    @Param('contractId') id: string,
    @Body() body: unknown,
  ) {
    return this.financialLifecycle.apply(id, body);
  }
  @Get('plans')
  async listPlans(@Query('includeArchived') includeArchived?: string) {
    const plans = await this.planCatalog.list(includeArchived === 'true');

    return {
      plans: plans.map((plan) => LicensePlanPresenter.toHttp(plan)),
    };
  }

  @Post('plans')
  async createPlan(
    @Body(new ZodValidationPipe(licensePlanRequestSchema))
    body: LicensePlanRequestDto,
  ) {
    const plan = await this.planCatalog.create(body);

    return LicensePlanPresenter.toHttp(plan);
  }

  @Put('plans/:planId')
  async updatePlan(
    @Param('planId') planId: string,
    @Body(new ZodValidationPipe(licensePlanRequestSchema))
    body: LicensePlanRequestDto,
  ) {
    const plan = await this.planCatalog.update(planId, body);

    return LicensePlanPresenter.toHttp(plan);
  }

  @Delete('plans/:planId')
  async archivePlan(@Param('planId') planId: string) {
    const plan = await this.planCatalog.archive(planId);

    return LicensePlanPresenter.toHttp(plan);
  }

  @Get()
  async list() {
    const result = await this.listLicenses.execute();

    return {
      licenses: result.licenses.map((license) =>
        LicensePresenter.listItemToHttp(license),
      ),
    };
  }

  @Post('activate')
  async activate(
    @Body(new ZodValidationPipe(activateLicenseRequestSchema))
    body: ActivateLicenseRequestDto,
  ) {
    const result = await this.activateLicense.execute({
      customerId: body.customerId,
      contractId: body.contractId,
      installationName: body.installationName,
      expiresAt: new Date(body.expiresAt),
      entitlements: await this.resolveEntitlements(
        body.planId,
        body.entitlements,
      ),
    });

    return {
      ...LicensePresenter.toHttp(result),
      licenseKey: result.licenseKey,
      licenseToken: result.licenseToken,
      installationFingerprint: result.installationFingerprint,
    };
  }

  @Post(':licenseInstanceId/reissue')
  async reissue(
    @Param(new ZodValidationPipe(licenseInstanceParamsSchema))
    params: LicenseInstanceParamsDto,
    @Body(new ZodValidationPipe(reissueLicenseRequestSchema))
    body: ReissueLicenseRequestDto,
  ) {
    const result = await this.reissueLicense.execute({
      licenseInstanceId: params.licenseInstanceId,
      expiresAt: new Date(body.expiresAt),
      entitlements: await this.resolveEntitlements(
        body.planId,
        body.entitlements,
      ),
    });

    return {
      ...LicensePresenter.toHttp(result),
      licenseKey: result.licenseKey,
      licenseToken: result.licenseToken,
      installationFingerprint: result.installationFingerprint,
    };
  }

  @Post('contracts/:contractId/revoke')
  async revokeByContract(@Param('contractId') contractId: string) {
    return this.revokeContractLicenses.execute({ contractId });
  }

  @Get('contracts/:contractId/active')
  async getActiveByContract(@Param('contractId') contractId: string) {
    const result = await this.getActiveContractLicense.execute({ contractId });

    if (!result) {
      return { license: null };
    }

    return {
      license: {
        ...LicensePresenter.toHttp(result),
        licenseKey: result.licenseKey,
        licenseToken: result.licenseToken,
        installationFingerprint: result.installationFingerprint,
      },
    };
  }

  private async resolveEntitlements(
    planId?: string,
    entitlements?: Record<string, boolean | number | string>,
  ): Promise<Record<string, boolean | number | string>> {
    if (!planId) {
      return entitlements ?? {};
    }

    return this.planCatalog.resolveEntitlements(planId, entitlements);
  }
}
