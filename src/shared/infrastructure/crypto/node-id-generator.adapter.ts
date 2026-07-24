import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IdGeneratorPort } from '../../application/ports/id-generator.port';

@Injectable()
export class NodeIdGeneratorAdapter implements IdGeneratorPort {
  generate(prefix?: string): string {
    const id = randomUUID();

    return prefix ? `${prefix}_${id}` : id;
  }
}
