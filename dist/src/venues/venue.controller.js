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
exports.VenuesController = void 0;
const common_1 = require("@nestjs/common");
const venue_service_1 = require("./venue.service");
const venue_dto_1 = require("./dtos/venue.dto");
const jwt_guard_1 = require("../auth/jwt.guard");
let VenuesController = class VenuesController {
    constructor(venuesService) {
        this.venuesService = venuesService;
    }
    async findAll(query) {
        return this.venuesService.findAll(query);
    }
    async userVenues(req, res) {
        try {
            const venues = await this.venuesService.userVenues(req.user.id);
            if (venues.length > 0) {
                return res.status(common_1.HttpStatus.OK).json(venues);
            }
            else {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({ message: 'No venues found' });
            }
        }
        catch (error) {
            throw new common_1.HttpException('Error fetching user venues', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async areas() {
        try {
            return this.venuesService.findAllKarachiAreas();
        }
        catch (error) {
            throw new common_1.HttpException('Error fetching Karachi areas', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        return this.venuesService.findOne(id);
    }
    async create(createVenueDto, req) {
        createVenueDto.created_by = req.user.id;
        return this.venuesService.create(createVenueDto);
    }
    async update(id, updateVenueDto) {
        return this.venuesService.update(id, updateVenueDto);
    }
    async remove(id) {
        return this.venuesService.remove(id);
    }
    async toggleStatus(id) {
        return this.venuesService.toggleStatus(id);
    }
};
exports.VenuesController = VenuesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [venue_dto_1.VenueQueryDto]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('vendor-venues'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "userVenues", null);
__decorate([
    (0, common_1.Get)('get-all-karachi-areas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "areas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [venue_dto_1.CreateVenueDto, Object]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, venue_dto_1.UpdateVenueDto]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/toggle-status'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VenuesController.prototype, "toggleStatus", null);
exports.VenuesController = VenuesController = __decorate([
    (0, common_1.Controller)("venues"),
    __metadata("design:paramtypes", [venue_service_1.VenuesService])
], VenuesController);
//# sourceMappingURL=venue.controller.js.map