import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  LICENSE_SIGNATURE_PORT,
  type LicenseSignaturePort,
} from '../ports/license-signature.port';
import { EntitlementSnapshot } from '../../domain/entities/entitlement-snapshot.entity';
const schema = z
  .object({
    customerId: z.uuid(),
    sourceVersion: z.number().int().positive().safe(),
    state: z.enum(['active', 'suspended']),
    validUntil: z.iso.datetime({ offset: true }),
    graceDays: z.number().int().min(0).max(30),
    entitlements: z.record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean()]),
    ),
  })
  .strict();
interface Instance {
  id: string;
  customer_id: string;
  current_version: number;
  status: 'active' | 'suspended';
  expires_at: Date;
}
@Injectable()
export class FinancialLifecycleService {
  constructor(
    @Optional()
    @InjectDataSource()
    private readonly source: DataSource | undefined,
    @Inject(LICENSE_SIGNATURE_PORT)
    private readonly signer: LicenseSignaturePort,
  ) {}
  async apply(contractId: string, body: unknown) {
    const parsed = schema.safeParse(body);
    if (!z.uuid().safeParse(contractId).success || !parsed.success)
      throw new BadRequestException('Decisão financeira inválida.');
    if (!this.source)
      throw new ServiceUnavailableException(
        'Ciclo financeiro requer persistência PostgreSQL.',
      );
    const input = parsed.data,
      hash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    return this.source.transaction(async (tx) => {
      await tx.query(`SELECT pg_advisory_xact_lock(hashtextextended($1,0))`, [
        contractId,
      ]);
      const [prior] = await tx.query<
        Array<{
          source_version: string;
          request_hash: string;
          response: unknown;
        }>
      >(
        `SELECT * FROM licensing.financial_lifecycle WHERE contract_id=$1 FOR UPDATE`,
        [contractId],
      );
      if (prior && Number(prior.source_version) >= input.sourceVersion) {
        if (
          Number(prior.source_version) === input.sourceVersion &&
          prior.request_hash !== hash
        )
          throw new ConflictException(
            'Versão financeira usada para outra decisão.',
          );
        return prior.response;
      }
      const instances = await tx.query<Instance[]>(
        `SELECT i.id,i.customer_id,i.current_version,i.status,i.expires_at FROM licensing.license_instances i
         WHERE i.contract_id=$1 AND (i.status='active' OR (i.status='suspended' AND EXISTS (
           SELECT 1 FROM licensing.entitlement_snapshots s WHERE s.license_instance_id=i.id AND s.version=i.current_version
             AND s.entitlements->>'financialSuspended'='true'))) ORDER BY i.id FOR UPDATE`,
        [contractId],
      );
      const now = new Date(),
        until = new Date(input.validUntil);
      const suspendAt = input.entitlements.financialSuspendAt;
      const financialGrace =
        typeof suspendAt === 'string' && suspendAt ? new Date(suspendAt) : null;
      if (financialGrace && !Number.isFinite(financialGrace.getTime()))
        throw new BadRequestException('Prazo financeiro inválido.');
      const grace =
        financialGrace ??
        new Date(until.getTime() + input.graceDays * 86400000);
      const deferredSuspension =
        input.entitlements.financialManaged === true &&
        ['payment_attention', 'payment_restricted'].includes(
          String(input.entitlements.financialAccessState),
        ) &&
        grace > now;
      if (input.state === 'active' && until <= now && !deferredSuspension)
        throw new ConflictException('Período pago já expirou.');
      for (const row of instances) {
        if (row.customer_id !== input.customerId)
          throw new ConflictException('Licença pertence a outro cliente.');
        const snapshot = EntitlementSnapshot.create({
          id: `ent_snap_${randomUUID()}`,
          licenseInstanceId: row.id,
          version: row.current_version + 1,
          status: input.state,
          entitlements: {
            ...input.entitlements,
            financialSuspended: input.state === 'suspended',
          },
          validFrom: now,
          validUntil: until,
          gracePeriodUntil: grace,
          createdAt: now,
        });
        const signature = await this.signer.sign(snapshot);
        await tx.query(
          `UPDATE licensing.license_instances SET current_version=$2,status=$3,expires_at=$4,grace_period_until=$5,updated_at=now() WHERE id=$1`,
          [row.id, snapshot.version, input.state, until, grace],
        );
        await tx.query(
          `INSERT INTO licensing.entitlement_snapshots(id,license_instance_id,version,status,entitlements,valid_from,valid_until,grace_period_until,signature) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            snapshot.id,
            row.id,
            snapshot.version,
            input.state,
            JSON.stringify(snapshot.entitlements),
            now,
            until,
            grace,
            signature,
          ],
        );
        // Keep the installed credential usable; revoke decisions are never undone here.
        if (input.state === 'active')
          await tx.query(
            `UPDATE licensing.license_tokens SET expires_at=$2 WHERE license_instance_id=$1 AND revoked_at IS NULL`,
            [row.id, grace],
          );
      }
      const response = {
        contractId,
        sourceVersion: input.sourceVersion,
        state: input.state,
        updated: instances.length,
      };
      await tx.query(
        `INSERT INTO licensing.financial_lifecycle(contract_id,source_version,request_hash,response) VALUES($1,$2,$3,$4) ON CONFLICT(contract_id) DO UPDATE SET source_version=excluded.source_version,request_hash=excluded.request_hash,response=excluded.response,updated_at=now()`,
        [contractId, input.sourceVersion, hash, JSON.stringify(response)],
      );
      return response;
    });
  }
}
