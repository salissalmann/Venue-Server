import { Module } from '@nestjs/common';
import { OracleService } from '../oracle/oracle.service';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [OracleService, HealthService],
})
export class HealthModule {}
