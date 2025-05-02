import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UsersService } from './users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }
    
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'asdllkasfdservdfdrrr12345678696983';
      const payload = jwt.verify(token, secret) as { sub: string; username: string };
      
      const userId = parseInt(payload.sub);
      if (isNaN(userId)) {
        throw new UnauthorizedException('Invalid token');
      }
      
      // Check if user exists and is not disabled
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      if (user.is_disabled) {
        throw new UnauthorizedException('User is disabled');
      }
      
      // Set user on request object
      request.user = { id: userId, username: payload.username };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 