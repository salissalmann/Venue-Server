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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const config_1 = require("@nestjs/config");
const jwt = require("jsonwebtoken");
let AuthService = class AuthService {
    constructor(usersService, configService) {
        this.usersService = usersService;
        this.configService = configService;
    }
    async validateUser(email, password) {
        return this.usersService.validateUser(email, password);
    }
    async generateTokens(user) {
        const payload = { username: user.first_name, sub: user.id.toString() };
        const accessTokenSecret = this.configService.get('JWT_SECRET') || 'asdllkasfdservdfdrrr12345678696983';
        const refreshTokenSecret = this.configService.get('JWT_REFRESH_SECRET') || 'asdllkasfdservdfdrrr12345678696983fairticketrefreshtoken';
        const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: '1d' });
        const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '7d' });
        await this.usersService.updateRefreshToken(user.id, refreshToken);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async refreshTokens(refreshToken) {
        try {
            const refreshTokenSecret = this.configService.get('JWT_REFRESH_SECRET') || 'asdllkasfdservdfdrrr12345678696983fairticketrefreshtoken';
            const payload = jwt.verify(refreshToken, refreshTokenSecret);
            const userId = parseInt(payload.sub);
            if (isNaN(userId)) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            const user = await this.usersService.findById(userId);
            if (!user || user.refresh_token !== refreshToken) {
                throw new common_1.UnauthorizedException('Invalid or mismatched refresh token');
            }
            if (user.is_disabled) {
                throw new common_1.UnauthorizedException('User is disabled');
            }
            const { password, ...result } = user;
            const tokens = await this.generateTokens(result);
            return {
                ...tokens,
                user: result,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map