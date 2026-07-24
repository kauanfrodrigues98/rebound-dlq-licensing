import { Test, TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Response } from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DomainErrorFilter } from '../src/shared/interfaces/http/filters/domain-error.filter';

interface ActivationResponseBody {
  licenseInstanceId: string;
  licenseKey: string;
  licenseToken: string;
  installationFingerprint: string;
  entitlements: Record<string, boolean | number | string>;
}

interface LicensePlanResponseBody {
  id: string;
  name: string;
  active: boolean;
  entitlements: Record<string, boolean | number | string>;
}

interface LicensePlansResponseBody {
  plans: LicensePlanResponseBody[];
}

interface CheckInResponseBody {
  licenseInstanceId: string;
  hasUpdate: boolean;
  entitlements: {
    maxProjects: number;
  };
}

describe('Licensing API (e2e)', () => {
  let app: INestApplication<App>;
  const adminApiKey = 'local-development-admin-api-key-secret';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainErrorFilter());
    await app.init();
  });

  it('activates and checks in a license', async () => {
    await request(app.getHttpServer())
      .get('/admin/licenses/plans')
      .set('x-admin-api-key', adminApiKey)
      .expect(200)
      .expect((response: Response) => {
        const body = response.body as LicensePlansResponseBody;
        expect(body.plans).toHaveLength(3);
        expect(body.plans[0].id).toBe('self-hosted-starter');
      });

    const planCreate = await request(app.getHttpServer())
      .post('/admin/licenses/plans')
      .set('x-admin-api-key', adminApiKey)
      .send({
        id: 'self-hosted-growth',
        name: 'Self-hosted Growth',
        description: 'Growth customers.',
        cadence: 'monthly',
        featured: false,
        priceLabel: 'R$ 1.490/mês',
        active: true,
        sortOrder: 15,
        entitlements: {
          maxProjects: 8,
          maxUsers: 25,
          maxMonthlyEvents: 75000,
          retentionDays: 60,
          aiEnabled: true,
          automaticReplayEnabled: false,
          supportSlaHours: 48,
        },
      })
      .expect(201);
    expect((planCreate.body as LicensePlanResponseBody).entitlements.maxUsers).toBe(
      25,
    );

    await request(app.getHttpServer())
      .put('/admin/licenses/plans/self-hosted-growth')
      .set('x-admin-api-key', adminApiKey)
      .send({
        id: 'self-hosted-growth',
        name: 'Self-hosted Growth',
        description: 'Growth customers with more projects.',
        cadence: 'monthly',
        featured: false,
        priceLabel: 'R$ 1.790/mês',
        active: true,
        sortOrder: 15,
        entitlements: {
          maxProjects: 10,
          maxUsers: 25,
          maxMonthlyEvents: 90000,
          retentionDays: 60,
          aiEnabled: true,
          automaticReplayEnabled: true,
          supportSlaHours: 48,
        },
      })
      .expect(200)
      .expect((response: Response) => {
        expect(
          (response.body as LicensePlanResponseBody).entitlements.maxProjects,
        ).toBe(10);
      });

    await request(app.getHttpServer())
      .delete('/admin/licenses/plans/self-hosted-growth')
      .set('x-admin-api-key', adminApiKey)
      .expect(200)
      .expect((response: Response) => {
        expect((response.body as LicensePlanResponseBody).active).toBe(false);
      });

    const activation = await request(app.getHttpServer())
      .post('/admin/licenses/activate')
      .set('x-admin-api-key', adminApiKey)
      .send({
        customerId: 'cus_123',
        contractId: 'con_123',
        installationName: 'Acme Production',
        expiresAt: '2026-12-31T23:59:59.000Z',
        entitlements: {
          maxProjects: 10,
          maxUsers: 30,
          aiAnalysisEnabled: true,
        },
      })
      .expect(201);
    const activationBody = activation.body as ActivationResponseBody;
    expect(activationBody.licenseKey).toMatch(/^rbdlic_/);

    const planActivation = await request(app.getHttpServer())
      .post('/admin/licenses/activate')
      .set('x-admin-api-key', adminApiKey)
      .send({
        customerId: 'cus_plan',
        contractId: 'con_plan',
        installationName: 'Plan Based Production',
        expiresAt: '2026-12-31T23:59:59.000Z',
        planId: 'self-hosted-business',
      })
      .expect(201);
    const planActivationBody = planActivation.body as ActivationResponseBody;
    expect(planActivationBody.entitlements.planId).toBe('self-hosted-business');
    expect(planActivationBody.entitlements.maxUsers).toBe(50);

    await request(app.getHttpServer())
      .post('/licenses/check-in')
      .send({
        licenseToken: activationBody.licenseToken,
        installationFingerprint: activationBody.installationFingerprint,
        currentLicenseVersion: 0,
        appVersion: '0.1.0',
        usage: {
          projects: 1,
          users: 2,
          monthlyEvents: 100,
        },
      })
      .expect(201)
      .expect((response: Response) => {
        const body = response.body as CheckInResponseBody;

        expect(body.licenseInstanceId).toBe(activationBody.licenseInstanceId);
        expect(body.hasUpdate).toBe(true);
        expect(body.entitlements.maxProjects).toBe(10);
      });

    await request(app.getHttpServer())
      .post('/licenses/check-in')
      .send({
        licenseToken: activationBody.licenseToken,
        installationFingerprint: 'wrong-fingerprint-production-001',
        currentLicenseVersion: 1,
        appVersion: '0.1.0',
        usage: {
          projects: 1,
          users: 2,
          monthlyEvents: 100,
        },
      })
      .expect(403);
  });

  afterEach(async () => {
    await app.close();
  });
});
