import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../../../../shared/interfaces/http/pipes/zod-validation.pipe';
import { CheckInLicenseUseCase } from '../../../application/use-cases/check-in-license/check-in-license.use-case';
import { GetCurrentLicenseUseCase } from '../../../application/use-cases/get-current-license/get-current-license.use-case';
import { checkInLicenseRequestSchema } from '../dto/check-in-license.request.dto';
import type { CheckInLicenseRequestDto } from '../dto/check-in-license.request.dto';
import { licenseInstanceParamsSchema } from '../dto/license-params.dto';
import type { LicenseInstanceParamsDto } from '../dto/license-params.dto';
import { LicensePresenter } from '../presenters/license.presenter';

@Controller('licenses')
export class LicensePublicController {
  constructor(
    private readonly checkInLicense: CheckInLicenseUseCase,
    private readonly getCurrentLicense: GetCurrentLicenseUseCase,
  ) {}

  @Post('check-in')
  async checkIn(
    @Body(new ZodValidationPipe(checkInLicenseRequestSchema))
    body: CheckInLicenseRequestDto,
  ) {
    const result = await this.checkInLicense.execute({
      licenseToken: body.licenseToken,
      installationFingerprint: body.installationFingerprint,
      currentLicenseVersion: body.currentLicenseVersion,
      appVersion: body.appVersion,
      usage: body.usage,
    });

    return {
      ...LicensePresenter.toHttp(result),
      hasUpdate: result.hasUpdate,
    };
  }

  @Get(':licenseInstanceId/current')
  async current(
    @Param(new ZodValidationPipe(licenseInstanceParamsSchema))
    params: LicenseInstanceParamsDto,
  ) {
    const result = await this.getCurrentLicense.execute({
      licenseInstanceId: params.licenseInstanceId,
    });

    return LicensePresenter.toHttp(result);
  }
}
