import { UsersService } from './users.service';
import { User } from '../db/schema';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private usersService;
    private configService;
    constructor(usersService: UsersService, configService: ConfigService);
    validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null>;
    generateTokens(user: Omit<User, 'password'>): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        user: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            country_code: string;
            phone_no: string;
            is_google: boolean;
            image: string;
            city: string;
            state: string;
            country: string;
            is_disabled: boolean;
            is_deleted: boolean;
            email_verified: boolean;
            refresh_token: string;
            created_at: Date;
            updated_at: Date;
            role: string[];
        };
        access_token: string;
        refresh_token: string;
    }>;
}
