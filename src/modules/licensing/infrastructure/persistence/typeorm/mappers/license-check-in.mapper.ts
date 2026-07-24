import { LicenseCheckIn } from '../../../../domain/entities/license-check-in.entity';
import { LicenseCheckInOrmEntity } from '../entities/license-check-in.orm-entity';

export class LicenseCheckInMapper {
  static toOrm(domain: LicenseCheckIn): LicenseCheckInOrmEntity {
    const orm = new LicenseCheckInOrmEntity();
    orm.id = domain.id;
    orm.licenseInstanceId = domain.licenseInstanceId;
    orm.appVersion = domain.appVersion;
    orm.currentLicenseVersion = domain.currentLicenseVersion ?? null;
    orm.usageProjects = domain.usage.projects;
    orm.usageUsers = domain.usage.users;
    orm.usageMonthlyEvents = domain.usage.monthlyEvents;
    orm.checkedAt = domain.checkedAt;

    return orm;
  }
}
