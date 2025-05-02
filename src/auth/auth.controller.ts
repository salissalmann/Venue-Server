import { 
  Controller, 
  Post, 
  Body, 
  BadRequestException, 
  ConflictException, 
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.OK)
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      if (!signUpDto.email || !signUpDto.password || !signUpDto.first_name || !signUpDto.last_name || 
          !signUpDto.phone_no || !signUpDto.country_code) {
        throw new BadRequestException({
          status: false,
          message: 'Missing required fields: email, first_name, last_name, password, phone_no, country_code',
          data: null
        });
      }

      // Check if email exists
      const emailExists = await this.usersService.findByEmail(signUpDto.email);
      if (emailExists) {
        throw new ConflictException({
          status: false,
          message: 'Email already in use',
          data: null
        });
      }

      // Check if phone number exists
      const phoneExists = await this.usersService.findByPhoneNumber(signUpDto.country_code, signUpDto.phone_no);
      if (phoneExists) {
        throw new ConflictException({
          status: false,
          message: 'Phone number already in use',
          data: null
        });
      }

      // Create user
      const user = await this.usersService.create(signUpDto);

      // Generate tokens
      const { password, ...userData } = user;
      const tokens = await this.authService.generateTokens(userData);

      return {
        status: true,
        message: 'User signed up successfully',
        data: userData,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      };
    } catch (error) {
      console.error('Error in signup:', error);
      if (error instanceof HttpException) {
        throw error; // Re-throw NestJS exceptions
      }
      throw new HttpException({
        status: false,
        message: 'Failed to sign up user',
        data: null,
        error: 'Failed to sign up user'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('log-in')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException({
          status: false,
          message: 'Missing required fields: email, password',
          data: null
        });
      }

      const user = await this.usersService.findByEmail(loginDto.email.toLowerCase());
      if (!user || !user.password) {
        throw new BadRequestException({
          status: false,
          message: 'Invalid Credentials',
          data: null
        });
      }

      const validatedUser = await this.authService.validateUser(loginDto.email, loginDto.password);
      if (!validatedUser) {
        throw new BadRequestException({
          status: false,
          message: 'Invalid Credentials',
          data: null
        });
      }

      if (!user.email_verified) {
        throw new BadRequestException({
          status: false,
          message: 'Email not verified',
          data: null
        });
      }

      if (user.is_disabled) {
        throw new BadRequestException({
          status: false,
          message: 'Restricted User',
          data: null
        });
      }

      // Generate tokens
      const tokens = await this.authService.generateTokens(validatedUser);

      return {
        status: true,
        message: 'Login Successful',
        user: validatedUser,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      };
    } catch (error) {
      console.error('Error in login:', error);
      if (error instanceof HttpException) {
        throw error; // Re-throw NestJS exceptions
      }
      throw new HttpException({
        status: false,
        message: 'Failed to log in user',
        data: null
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      if (!refreshTokenDto.refresh_token) {
        throw new BadRequestException({
          status: false,
          message: 'Refresh token is required'
        });
      }

      const result = await this.authService.refreshTokens(refreshTokenDto.refresh_token);

      return {
        status: true,
        message: 'Token refreshed successfully',
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        user: result.user
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        if (error.message.includes('expired')) {
          throw new HttpException({
            status: false,
            message: 'Refresh token has expired'
          }, HttpStatus.UNAUTHORIZED);
        }
        throw new HttpException({
          status: false,
          message: 'Invalid refresh token'
        }, HttpStatus.UNAUTHORIZED);
      }

      console.error('Error in refresh token:', error);
      throw new HttpException({
        status: false,
        message: 'Failed to refresh token'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: any) {
    try {
      const userId = req.user.id;
      
      if (!userId) {
        throw new UnauthorizedException({
          status: false,
          message: 'Unauthorized'
        });
      }

      const user = await this.usersService.findById(userId);
      
      if (!user) {
        throw new HttpException({
          status: false,
          message: 'User not found'
        }, HttpStatus.NOT_FOUND);
      }

      const { password, ...userData } = user;

      return {
        status: true,
        message: 'Data fetched successfully',
        user: userData
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error instanceof HttpException) {
        throw error; // Re-throw NestJS exceptions
      }
      throw new HttpException({
        status: false,
        message: 'Failed to fetch user data'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 