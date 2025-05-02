import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { User } from '../db/schema';
import { SignUpDto } from './dto/signup.dto';
export declare class UsersService {
    private db;
    constructor(db: NodePgDatabase<any>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    findByPhoneNumber(countryCode: string, phoneNo: string): Promise<User | null>;
    create(userData: SignUpDto): Promise<User>;
    updateRefreshToken(userId: number, refreshToken: string): Promise<User>;
    validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null>;
}
