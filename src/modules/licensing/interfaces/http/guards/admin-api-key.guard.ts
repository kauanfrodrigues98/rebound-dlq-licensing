import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { appConfig } from '../../../../../config/app.config';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.header('x-admin-api-key');

    if (!apiKey || !this.matchesConfiguredKey(apiKey)) {
      throw new UnauthorizedException('Invalid admin API key.');
    }

    return true;
  }

  private matchesConfiguredKey(apiKey: string): boolean {
    const expected = Buffer.from(appConfig().adminApiKey);
    const received = Buffer.from(apiKey);

    return (
      expected.length === received.length && timingSafeEqual(expected, received)
    );
  }
}
