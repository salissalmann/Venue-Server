"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = require("bcrypt");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../db/schema");
let UsersService = class UsersService {
    constructor(db) {
        this.db = db;
    }
    async findByEmail(email) {
        const result = await this.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
        return result.length > 0 ? result[0] : null;
    }
    async findById(id) {
        const result = await this.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).limit(1);
        return result.length > 0 ? result[0] : null;
    }
    async findByPhoneNumber(countryCode, phoneNo) {
        const result = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.country_code, countryCode), (0, drizzle_orm_1.eq)(schema_1.users.phone_no, phoneNo)))
            .limit(1);
        return result.length > 0 ? result[0] : null;
    }
    async create(userData) {
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already in use');
        }
        const existingPhone = await this.findByPhoneNumber(userData.country_code, userData.phone_no);
        if (existingPhone) {
            throw new common_1.ConflictException('Phone number already in use');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = {
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            first_name: userData.first_name,
            last_name: userData.last_name,
            country_code: userData.country_code,
            phone_no: userData.phone_no,
            email_verified: true,
            ...(userData.city ? { city: userData.city } : {}),
            ...(userData.state ? { state: userData.state } : {}),
            ...(userData.country ? { country: userData.country } : {}),
            ...(userData.image ? { image: userData.image } : {}),
            ...(userData.role && userData.role.length > 0 ? { role: userData.role } : {})
        };
        const result = await this.db.insert(schema_1.users).values(newUser).returning();
        return result[0];
    }
    async updateRefreshToken(userId, refreshToken) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `UPDATE users SET refresh_token = ${refreshToken} WHERE id = ${userId} RETURNING *`);
        const rows = result.rows;
        if (!rows || rows.length === 0) {
            throw new common_1.NotFoundException('User not found');
        }
        return rows[0];
    }
    async validateUser(email, password) {
        const user = await this.findByEmail(email.toLowerCase());
        if (!user) {
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }
        const { password: _, ...result } = user;
        return result;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_CONNECTION')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], UsersService);
//# sourceMappingURL=users.service.js.map