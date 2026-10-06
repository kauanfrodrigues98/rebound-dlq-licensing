import { Inject, Injectable } from '@nestjs/common';
import { CLOCK_PORT } from '../../../../shared/application/ports/clock.port';
import type { ClockPort } from '../../../../shared/application/ports/clock.port';
import { DomainError } from '../../../../shared/domain/errors/domain-error';
import {
  LicensePlan,
  LicensePlanCadence,
} from '../../domain/entities/license-plan.entity';
import {
  LICENSE_PLAN_REPOSITORY,
} from '../ports/license-plan.repository';
import type { LicensePlanRepository } from '../ports/license-plan.repository';

export interface LicensePlanCatalogItem {
  id: string;
  name: string;
  description: string;
  cadence: LicensePlanCadence;
  deployment?: 'cloud' | 'self_hosted';
  featured: boolean;
  priceLabel: string;
  entitlements: Record<string, boolean | number | string>;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveLicensePlanInput {
  id: string;
  name: string;
  description: string;
  cadence: LicensePlanCadence;
  deployment?: 'cloud' | 'self_hosted';
  featured: boolean;
  priceLabel: string;
  entitlements: Record<string, boolean | number | string>;
  active: boolean;
  sortOrder: number;
}

export class LicensePlanNotFoundError extends DomainError {
  constructor(planId: string) {
    super(`License plan "${planId}" was not found.`);
  }
}

export class LicensePlanInactiveError extends DomainError {
  constructor(planId: string) {
    super(`License plan "${planId}" is archived and cannot be used.`);
  }
}

@Injectable()
export class LicensePlanCatalogService {
  constructor(
    @Inject(LICENSE_PLAN_REPOSITORY)
    private readonly plans: LicensePlanRepository,
    @Inject(CLOCK_PORT)
    private readonly clock: ClockPort,
  ) {}

  async list(includeArchived = false): Promise<LicensePlanCatalogItem[]> {
    await this.ensureDefaultPlans();
    const plans = await this.plans.findAll();

    return plans
      .filter((plan) => includeArchived || plan.active)
      .map((plan) => this.toCatalogItem(plan));
  }

  async create(input: SaveLicensePlanInput): Promise<LicensePlanCatalogItem> {
    const existing = await this.plans.findById(input.id);

    if (existing) {
      throw new DomainError(`License plan "${input.id}" already exists.`);
    }

    const now = this.clock.now();
    const plan = LicensePlan.create({
      ...input,
      entitlements: { ...input.entitlements },
      createdAt: now,
      updatedAt: now,
    });

    await this.plans.save(plan);

    return this.toCatalogItem(plan);
  }

  async update(
    planId: string,
    input: SaveLicensePlanInput,
  ): Promise<LicensePlanCatalogItem> {
    const plan = await this.findRequired(planId);

    plan.update(
      {
        name: input.name,
        description: input.description,
        cadence: input.cadence,
        deployment: input.deployment ?? plan.deployment,
        featured: input.featured,
        priceLabel: input.priceLabel,
        entitlements: { ...input.entitlements },
        active: input.active,
        sortOrder: input.sortOrder,
      },
      this.clock.now(),
    );

    await this.plans.save(plan);

    return this.toCatalogItem(plan);
  }

  async archive(planId: string): Promise<LicensePlanCatalogItem> {
    const plan = await this.findRequired(planId);

    plan.archive(this.clock.now());
    await this.plans.save(plan);

    return this.toCatalogItem(plan);
  }

  async resolveEntitlements(
    planId: string,
    overrides: Record<string, boolean | number | string> = {},
  ): Promise<Record<string, boolean | number | string>> {
    await this.ensureDefaultPlans();
    const plan = await this.findRequired(planId);

    if (!plan.active) {
      throw new LicensePlanInactiveError(planId);
    }

    return {
      ...plan.entitlements,
      planId: plan.id,
      planName: plan.name,
      cadence: plan.cadence,
      deployment: plan.deployment,
      ...overrides,
    };
  }

  private async findRequired(planId: string): Promise<LicensePlan> {
    const plan = await this.plans.findById(planId);

    if (!plan) {
      throw new LicensePlanNotFoundError(planId);
    }

    return plan;
  }

  private async ensureDefaultPlans(): Promise<void> {
    const existingPlans = await this.plans.findAll();

    if (existingPlans.length > 0) {
      return;
    }

    const now = this.clock.now();

    for (const plan of defaultPlans) {
      await this.plans.save(
        LicensePlan.create({
          ...plan,
          active: true,
          createdAt: now,
          updatedAt: now,
        }),
      );
    }
  }

  private toCatalogItem(plan: LicensePlan): LicensePlanCatalogItem {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      cadence: plan.cadence,
      deployment: plan.deployment,
      featured: plan.featured,
      priceLabel: plan.priceLabel,
      entitlements: plan.entitlements,
      active: plan.active,
      sortOrder: plan.sortOrder,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}

const defaultPlans: Array<
  Omit<LicensePlanCatalogItem, 'active' | 'createdAt' | 'updatedAt'>
> = [
  {
    id: 'self-hosted-starter',
    name: 'Self-hosted Starter',
    description: 'Operação inicial com limites previsíveis para pilotos.',
    cadence: 'monthly',
    featured: false,
    priceLabel: 'R$ 990/mês',
    sortOrder: 10,
    entitlements: {
      maxUsers: 10,
      maxProjects: 3,
      maxMonthlyEvents: 25000,
      retentionDays: 30,
      aiEnabled: false,
      automaticReplayEnabled: false,
      supportSlaHours: 72,
    },
  },
  {
    id: 'self-hosted-business',
    name: 'Self-hosted Business',
    description: 'Times em produção com IA, mais projetos e maior franquia.',
    cadence: 'monthly',
    featured: true,
    priceLabel: 'R$ 2.490/mês',
    sortOrder: 20,
    entitlements: {
      maxUsers: 50,
      maxProjects: 15,
      maxMonthlyEvents: 150000,
      retentionDays: 90,
      aiEnabled: true,
      automaticReplayEnabled: true,
      supportSlaHours: 24,
    },
  },
  {
    id: 'self-hosted-enterprise',
    name: 'Self-hosted Enterprise',
    description: 'Contrato customizado para ambientes críticos e alto volume.',
    cadence: 'contract',
    featured: false,
    priceLabel: 'Sob contrato',
    sortOrder: 30,
    entitlements: {
      maxUsers: 250,
      maxProjects: 100,
      maxMonthlyEvents: 1000000,
      retentionDays: 365,
      aiEnabled: true,
      automaticReplayEnabled: true,
      supportSlaHours: 8,
    },
  },
];
