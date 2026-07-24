import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { DomainErrorFilter } from './shared/interfaces/http/filters/domain-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = appConfig();

  app.useGlobalFilters(new DomainErrorFilter());

  await app.listen(config.port);
}
void bootstrap();
