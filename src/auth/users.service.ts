import { Inject, Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users, User, NewUser } from '../db/schema';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: NodePgDatabase<any>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async findByPhoneNumber(countryCode: string, phoneNo: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.country_code, countryCode),
          eq(users.phone_no, phoneNo)
        )
      )
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  async create(userData: SignUpDto): Promise<User> {
    const existingUser = await this.findByEmail(userData.email);
    
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    
    const existingPhone = await this.findByPhoneNumber(userData.country_code, userData.phone_no);
    
    if (existingPhone) {
      throw new ConflictException('Phone number already in use');
    }
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = {
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      first_name: userData.first_name,
      last_name: userData.last_name,
      country_code: userData.country_code,
      phone_no: userData.phone_no,
      email_verified: true, // Default to verified for this example
      ...(userData.city ? { city: userData.city } : {}),
      ...(userData.state ? { state: userData.state } : {}),
      ...(userData.country ? { country: userData.country } : {}),
      ...(userData.image ? { image: userData.image } : {}),
      ...(userData.role && userData.role.length > 0 ? { role: userData.role } : {})
    } as NewUser;
    
    const result = await this.db.insert(users).values(newUser).returning();
    return result[0];
  }

  async updateRefreshToken(userId: number, refreshToken: string): Promise<User> {
    const result = await this.db.execute(
      sql`UPDATE users SET refresh_token = ${refreshToken} WHERE id = ${userId} RETURNING *`
    );
    
    const rows = result.rows;
    if (!rows || rows.length === 0) {
      throw new NotFoundException('User not found');
    }
    
    return rows[0] as User;
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.findByEmail(email.toLowerCase());
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }
} 