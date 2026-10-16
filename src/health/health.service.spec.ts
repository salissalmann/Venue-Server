import { HealthService } from './health.service';
import { OracleService } from '../oracle/oracle.service';

describe('HealthService', () => {
  const original_env = process.env;

  beforeEach(() => {
    process.env = { ...original_env };
    delete process.env.ORACLE_USER;
    delete process.env.ORACLE_PASSWORD;
    delete process.env.ORACLE_CONNECT_STRING;
  });

  afterEach(() => {
    process.env = original_env;
  });

  it('reports ok when the database answers', async () => {
    const db = { execute: jest.fn().mockResolvedValue([]) };
    const service = new HealthService(db as never, new OracleService());

    const report = await service.report();

    expect(report.status).toBe('ok');
    expect(report.checks.database).toBe('up');
    expect(report.checks.oracle).toBe('not_configured');
    expect(report.oracle.product).toBe('Oracle Database');
    expect(report.uptime_seconds).toBeGreaterThanOrEqual(0);
    expect(db.execute).toHaveBeenCalledTimes(1);
  });

  it('reports degraded when the database check throws', async () => {
    const db = {
      execute: jest.fn().mockRejectedValue(new Error('connection refused')),
    };
    const service = new HealthService(db as never, new OracleService());

    const report = await service.report();

    expect(report.status).toBe('degraded');
    expect(report.checks.database).toBe('down');
  });

  it('marks Oracle integrated when the connection settings are set', async () => {
    process.env.ORACLE_USER = 'venue';
    process.env.ORACLE_PASSWORD = 'secret';
    process.env.ORACLE_CONNECT_STRING = 'localhost:1521/FREEPDB1';
    const db = { execute: jest.fn().mockResolvedValue([]) };
    const service = new HealthService(db as never, new OracleService());

    const report = await service.report();

    expect(report.checks.oracle).toBe('integrated');
    expect(report.oracle.connect_string).toBe('localhost:1521/FREEPDB1');
  });
});
