import { Module } from '@nestjs/common';
import { VenuesController } from './venue.controller';
import { VenuesService } from './venue.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}
