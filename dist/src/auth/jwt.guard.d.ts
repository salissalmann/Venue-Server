import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
export declare class JwtAuthGuard implements CanActivate {
    private reflector;
    private configService;
    private usersService;
    constructor(reflector: Reflector, configService: ConfigService, usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
