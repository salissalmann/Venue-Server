import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/database.module';
import { StorageModule } from './storage/storage.module';
import { VenuesModule } from './venues/venue.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    StorageModule,
    VenuesModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 