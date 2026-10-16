import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports ok when the database answers', async () => {
    const db = { execute: jest.fn().mockResolvedValue([]) };
    const service = new HealthService(db as never);

    const report = await service.report();

    expect(report.status).toBe('ok');
    expect(report.checks.database).toBe('up');
    expect(report.uptime_seconds).toBeGreaterThanOrEqual(0);
    expect(db.execute).toHaveBeenCalledTimes(1);
  });

  it('reports degraded when the database check throws', async () => {
    const db = {
      execute: jest.fn().mockRejectedValue(new Error('connection refused')),
    };
    const service = new HealthService(db as never);

    const report = await service.report();

    expect(report.status).toBe('degraded');
    expect(report.checks.database).toBe('down');
  });
});
