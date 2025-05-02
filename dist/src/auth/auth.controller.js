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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const auth_service_1 = require("./auth.service");
const signup_dto_1 = require("./dto/signup.dto");
const login_dto_1 = require("./dto/login.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const jwt_guard_1 = require("./jwt.guard");
let AuthController = class AuthController {
    constructor(usersService, authService) {
        this.usersService = usersService;
        this.authService = authService;
    }
    async signUp(signUpDto) {
        try {
            if (!signUpDto.email || !signUpDto.password || !signUpDto.first_name || !signUpDto.last_name ||
                !signUpDto.phone_no || !signUpDto.country_code) {
                throw new common_1.BadRequestException({
                    status: false,
                    message: 'Missing required fields: email, first_name, last_name, password, phone_no, country_code',
                    data: null
                });
            }
            const emailExists = await this.usersService.findByEmail(signUpDto.email);
            if (emailExists) {
                throw new common_1.ConflictException({
                    status: false,
                    message: 'Email already in use',
                    data: null
                });
            }
            const phoneExists = await this.usersService.findByPhoneNumber(signUpDto.country_code, signUpDto.phone_no);
            if (phoneExists) {
                throw new common_1.ConflictException({
                    status: false,
                    message: 'Phone number already in use',
                    data: null
                });
            }
            const user = await this.usersService.create(signUpDto);
            const { password, ...userData } = user;
            const tokens = await this.authService.generateTokens(userData);
            return {
                status: true,
                message: 'User signed up successfully',
                data: userData,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token
            };
        }
        catch (error) {
            console.error('Error in signup:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                status: false,
                message: 'Failed to sign up user',
                data: null,
                error: 'Failed to sign up user'
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(loginDto) {
        try {
            if (!loginDto.email || !loginDto.password) {
                throw new common_1.BadRequestException({
                    status: false,
                    message: 'Missing required fields: email, password',
                    data: null
                });
            }
            const user = await this.usersService.findByEmail(loginDto.email.toLowerCase());
            if (!user || !user.password) {
                throw new common_1.BadRequestException({
                    status: false,
                    message: 'Invalid Credentials',
                    data: null
                });
            }
            const validatedUser = await this.authService.validateUser(loginDto.email, loginDto.password);
            if (!validatedUser) {
                throw new common_1.BadRequestException({
                    status: false,
                    message: 'Invalid Credentials',
                    data: null
                });
            }
            if (!user.email_verified) {
                throw new common_1.BadRequestException({
                    status: false,
                    message: 'Email not verified',
                    data: null
                });
            }
            if (user.is_disabled) {
                throw new common_1.BadRequestException({
                    status: false,
                    message: 'Restricted User',
                    data: null
                });
            }
            const tokens = await this.authService.generateTokens(validatedUser);
            return {
                status: true,
                message: 'Login Successful',
                user: validatedUser,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token
            };
        }
        catch (error) {
            console.error('Error in login:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                status: false,
                message: 'Failed to log in user',
                data: null
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async refreshToken(refreshTokenDto) {
        try {
            if (!refreshTokenDto.refresh_token) {
                throw new common_1.BadRequestException({
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
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                if (error.message.includes('expired')) {
                    throw new common_1.HttpException({
                        status: false,
                        message: 'Refresh token has expired'
                    }, common_1.HttpStatus.UNAUTHORIZED);
                }
                throw new common_1.HttpException({
                    status: false,
                    message: 'Invalid refresh token'
                }, common_1.HttpStatus.UNAUTHORIZED);
            }
            console.error('Error in refresh token:', error);
            throw new common_1.HttpException({
                status: false,
                message: 'Failed to refresh token'
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUser(req) {
        try {
            const userId = req.user.id;
            if (!userId) {
                throw new common_1.UnauthorizedException({
                    status: false,
                    message: 'Unauthorized'
                });
            }
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new common_1.HttpException({
                    status: false,
                    message: 'User not found'
                }, common_1.HttpStatus.NOT_FOUND);
            }
            const { password, ...userData } = user;
            return {
                status: true,
                message: 'Data fetched successfully',
                user: userData
            };
        }
        catch (error) {
            console.error('Error fetching user data:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                status: false,
                message: 'Failed to fetch user data'
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('sign-up'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignUpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, common_1.Post)('log-in'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUser", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map