import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../db/schema';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    return this.usersService.validateUser(email, password);
  }

  async generateTokens(user: Omit<User, 'password'>) {
    const payload = { username: user.first_name, sub: user.id.toString() };
    
    const accessTokenSecret = this.configService.get<string>('JWT_SECRET') || 'asdllkasfdservdfdrrr12345678696983';
    const refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'asdllkasfdservdfdrrr12345678696983fairticketrefreshtoken';
    
    const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '7d' });
    
    // Update refresh token in database
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'asdllkasfdservdfdrrr12345678696983fairticketrefreshtoken';
      
      // Verify the refresh token
      const payload = jwt.verify(refreshToken, refreshTokenSecret) as { sub: string; username: string };
      
      // Convert sub to number and get user
      const userId = parseInt(payload.sub);
      if (isNaN(userId)) {
        throw new UnauthorizedException('Invalid token');
      }
      
      const user = await this.usersService.findById(userId);
      if (!user || user.refresh_token !== refreshToken) {
        throw new UnauthorizedException('Invalid or mismatched refresh token');
      }
      
      if (user.is_disabled) {
        throw new UnauthorizedException('User is disabled');
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      
      // Generate new tokens
      const tokens = await this.generateTokens(result);
      
      return {
        ...tokens,
        user: result,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 