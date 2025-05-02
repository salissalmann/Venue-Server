import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './jwt.guard';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtAuthGuard],
  exports: [AuthService, UsersService, JwtAuthGuard],
})
export class AuthModule {} 