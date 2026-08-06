import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../../../domain/errors/domain-error';

const domainErrorStatus: Record<string, HttpStatus> = {
  InvalidLicenseTokenError: HttpStatus.UNAUTHORIZED,
  InstallationFingerprintMismatchError: HttpStatus.FORBIDDEN,
  LicenseNotActiveError: HttpStatus.FORBIDDEN,
  LicenseNotFoundError: HttpStatus.NOT_FOUND,
  LicensePlanNotFoundError: HttpStatus.NOT_FOUND,
  LicensePlanInactiveError: HttpStatus.UNPROCESSABLE_ENTITY,
};

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      domainErrorStatus[exception.name] ?? HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
