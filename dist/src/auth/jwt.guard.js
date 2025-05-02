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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const jwt = require("jsonwebtoken");
const users_service_1 = require("./users.service");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(reflector, configService, usersService) {
        this.reflector = reflector;
        this.configService = configService;
        this.usersService = usersService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Missing authentication token');
        }
        try {
            const secret = this.configService.get('JWT_SECRET') || 'asdllkasfdservdfdrrr12345678696983';
            const payload = jwt.verify(token, secret);
            const userId = parseInt(payload.sub);
            if (isNaN(userId)) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            if (user.is_disabled) {
                throw new common_1.UnauthorizedException('User is disabled');
            }
            request.user = { id: userId, username: payload.username };
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        config_1.ConfigService,
        users_service_1.UsersService])
], JwtAuthGuard);
//# sourceMappingURL=jwt.guard.js.map