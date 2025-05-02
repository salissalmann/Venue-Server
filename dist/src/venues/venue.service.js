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
exports.VenuesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schemas_1 = require("../db/schemas");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema = require("../db/schemas");
let VenuesService = class VenuesService {
    constructor(db) {
        this.db = db;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, category, isActive, sortBy = "created_at", sortOrder = "desc" } = query;
        const offset = (page - 1) * limit;
        const filters = [];
        if (search) {
            filters.push((0, drizzle_orm_1.like)(schemas_1.venues.venue_name, `%${search}%`));
        }
        if (category) {
            filters.push((0, drizzle_orm_1.arrayContains)(schemas_1.venues.categories, [category]));
        }
        if (isActive !== undefined) {
            filters.push((0, drizzle_orm_1.eq)(schemas_1.venues.is_active, isActive));
        }
        let orderByClause;
        if (sortBy === "created_at") {
            orderByClause = sortOrder === "desc" ? (0, drizzle_orm_1.desc)(schemas_1.venues.created_at) : (0, drizzle_orm_1.asc)(schemas_1.venues.created_at);
        }
        else if (sortBy === "venue_name") {
            orderByClause = sortOrder === "desc" ? (0, drizzle_orm_1.desc)(schemas_1.venues.venue_name) : (0, drizzle_orm_1.asc)(schemas_1.venues.venue_name);
        }
        else if (sortBy === "id") {
            orderByClause = sortOrder === "desc" ? (0, drizzle_orm_1.desc)(schemas_1.venues.id) : (0, drizzle_orm_1.asc)(schemas_1.venues.id);
        }
        else {
            orderByClause = sortOrder === "desc" ? (0, drizzle_orm_1.desc)(schemas_1.venues.created_at) : (0, drizzle_orm_1.asc)(schemas_1.venues.created_at);
        }
        const whereClause = filters.length > 0 ? (0, drizzle_orm_1.and)(...filters) : undefined;
        const data = await this.db
            .select()
            .from(schemas_1.venues)
            .where(whereClause || undefined)
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);
        const total = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schemas_1.venues)
            .where(whereClause || undefined)
            .then((result) => Number(result[0].count));
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const venue = await this.db
            .select()
            .from(schemas_1.venues)
            .where((0, drizzle_orm_1.eq)(schemas_1.venues.id, id))
            .then(results => results[0]);
        if (!venue) {
            throw new common_1.NotFoundException(`Venue with ID ${id} not found`);
        }
        return venue;
    }
    async create(createVenueDto) {
        try {
            const venueData = {
                venue_name: createVenueDto.venue_name,
                venue_description: createVenueDto.venue_description,
                is_active: createVenueDto.is_active,
                created_by: createVenueDto.created_by,
                created_at: new Date(),
                updated_at: new Date()
            };
            if (createVenueDto.halls)
                venueData['halls'] = createVenueDto.halls;
            if (createVenueDto.start_price)
                venueData['start_price'] = createVenueDto.start_price;
            if (createVenueDto.end_price)
                venueData['end_price'] = createVenueDto.end_price;
            if (createVenueDto.location)
                venueData['location'] = createVenueDto.location;
            if (createVenueDto.time_slots)
                venueData['time_slots'] = createVenueDto.time_slots;
            if (createVenueDto.contact_info)
                venueData['contact_info'] = createVenueDto.contact_info;
            if (createVenueDto.amenities)
                venueData['amenities'] = createVenueDto.amenities;
            if (createVenueDto.categories)
                venueData['categories'] = createVenueDto.categories;
            if (createVenueDto.images)
                venueData['images'] = createVenueDto.images;
            if (createVenueDto.is_disabled !== undefined)
                venueData['is_disabled'] = createVenueDto.is_disabled;
            const result = await this.db
                .insert(schemas_1.venues)
                .values(venueData)
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating venue:', error);
            throw error;
        }
    }
    async update(id, updateVenueDto) {
        await this.findOne(id);
        try {
            const venueData = {
                updated_at: new Date()
            };
            if (updateVenueDto.venue_name !== undefined)
                venueData['venue_name'] = updateVenueDto.venue_name;
            if (updateVenueDto.venue_description !== undefined)
                venueData['venue_description'] = updateVenueDto.venue_description;
            if (updateVenueDto.is_active !== undefined)
                venueData['is_active'] = updateVenueDto.is_active;
            if (updateVenueDto.halls !== undefined)
                venueData['halls'] = updateVenueDto.halls;
            if (updateVenueDto.start_price !== undefined)
                venueData['start_price'] = updateVenueDto.start_price;
            if (updateVenueDto.end_price !== undefined)
                venueData['end_price'] = updateVenueDto.end_price;
            if (updateVenueDto.location !== undefined)
                venueData['location'] = updateVenueDto.location;
            if (updateVenueDto.time_slots !== undefined)
                venueData['time_slots'] = updateVenueDto.time_slots;
            if (updateVenueDto.contact_info !== undefined)
                venueData['contact_info'] = updateVenueDto.contact_info;
            if (updateVenueDto.amenities !== undefined)
                venueData['amenities'] = updateVenueDto.amenities;
            if (updateVenueDto.categories !== undefined)
                venueData['categories'] = updateVenueDto.categories;
            if (updateVenueDto.images !== undefined)
                venueData['images'] = updateVenueDto.images;
            if (updateVenueDto.is_disabled !== undefined)
                venueData['is_disabled'] = updateVenueDto.is_disabled;
            if (updateVenueDto.created_by !== undefined)
                venueData['created_by'] = updateVenueDto.created_by;
            const result = await this.db
                .update(schemas_1.venues)
                .set(venueData)
                .where((0, drizzle_orm_1.eq)(schemas_1.venues.id, id))
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error updating venue:', error);
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        await this.db.delete(schemas_1.venues).where((0, drizzle_orm_1.eq)(schemas_1.venues.id, id));
        return { id };
    }
    async toggleStatus(id) {
        const venue = await this.findOne(id);
        const result = await this.db
            .update(schemas_1.venues)
            .set({
            is_active: !venue.is_active,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schemas_1.venues.id, id))
            .returning();
        return result[0];
    }
    async findByCategory(category, query) {
        const queryWithCategory = {
            ...query,
            category
        };
        return this.findAll(queryWithCategory);
    }
    async findAllKarachiAreas() {
        try {
            const API_KEY = "AIzaSyDxt2Y8RUrRTqT_kxbLeygxgjvVlXI5Dbo";
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=neighborhoods+in+Karachi&key=${API_KEY}`);
            return response.json();
        }
        catch (error) {
            console.error('Error fetching Karachi areas:', error);
            throw error;
        }
    }
    async userVenues(userId) {
        try {
            const venues = await this.db.select().from(schema.venues).where((0, drizzle_orm_1.eq)(schema.venues.created_by, userId));
            return venues;
        }
        catch (error) {
            console.error('Error fetching user venues:', error);
            throw error;
        }
    }
};
exports.VenuesService = VenuesService;
exports.VenuesService = VenuesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_CONNECTION')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], VenuesService);
//# sourceMappingURL=venue.service.js.map