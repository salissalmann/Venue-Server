import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schemas';
import { OracleService } from '../oracle/oracle.service';

export type HealthReport = {
  status: 'ok' | 'degraded';
  uptime_seconds: number;
  timestamp: string;
  checks: {
    database: 'up' | 'down';
    oracle: 'integrated' | 'not_configured';
  };
  oracle: {
    product: 'Oracle Database';
    connect_string: string | null;
  };
};

@Injectable()
export class HealthService {
  private readonly started_at = Date.now();

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly oracleService: OracleService,
  ) {}

  async report(): Promise<HealthReport> {
    const database = await this.database_status();
    const oracle = this.oracleService.info();

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      uptime_seconds: Math.floor((Date.now() - this.started_at) / 1000),
      timestamp: new Date().toISOString(),
      checks: { database, oracle: oracle.status },
      oracle: {
        product: oracle.product,
        connect_string: oracle.connect_string,
      },
    };
  }

  private async database_status(): Promise<'up' | 'down'> {
    try {
      await this.db.execute(sql`select 1`);
      return 'up';
    } catch {
      return 'down';
    }
  }
}
