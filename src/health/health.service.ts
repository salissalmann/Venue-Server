import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schemas';

export type HealthReport = {
  status: 'ok' | 'degraded';
  uptime_seconds: number;
  timestamp: string;
  checks: {
    database: 'up' | 'down';
  };
};

@Injectable()
export class HealthService {
  private readonly started_at = Date.now();

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async report(): Promise<HealthReport> {
    const database = await this.database_status();

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      uptime_seconds: Math.floor((Date.now() - this.started_at) / 1000),
      timestamp: new Date().toISOString(),
      checks: { database },
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
