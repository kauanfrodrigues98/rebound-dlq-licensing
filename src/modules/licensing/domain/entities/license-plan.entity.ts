export type LicensePlanCadence = 'monthly' | 'annual' | 'contract';

export interface LicensePlanProps {
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

export class LicensePlan {
  private constructor(private readonly props: LicensePlanProps) {}

  static create(props: LicensePlanProps): LicensePlan {
    return new LicensePlan(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get cadence(): LicensePlanCadence {
    return this.props.cadence;
  }

  get deployment(): 'cloud' | 'self_hosted' {
    return this.props.deployment ?? 'self_hosted';
  }

  get featured(): boolean {
    return this.props.featured;
  }

  get priceLabel(): string {
    return this.props.priceLabel;
  }

  get entitlements(): Record<string, boolean | number | string> {
    return { ...this.props.entitlements };
  }

  get active(): boolean {
    return this.props.active;
  }

  get sortOrder(): number {
    return this.props.sortOrder;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(
    props: Omit<LicensePlanProps, 'id' | 'createdAt' | 'updatedAt'>,
    updatedAt: Date,
  ): void {
    this.props.name = props.name;
    this.props.description = props.description;
    this.props.cadence = props.cadence;
    this.props.deployment = props.deployment ?? this.deployment;
    this.props.featured = props.featured;
    this.props.priceLabel = props.priceLabel;
    this.props.entitlements = { ...props.entitlements };
    this.props.active = props.active;
    this.props.sortOrder = props.sortOrder;
    this.props.updatedAt = updatedAt;
  }

  archive(updatedAt: Date): void {
    this.props.active = false;
    this.props.featured = false;
    this.props.updatedAt = updatedAt;
  }
}
