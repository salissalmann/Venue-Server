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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schemas_1 = require("../db/schemas");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const storage_service_1 = require("../storage/storage.service");
let EventsService = class EventsService {
    constructor(db, storageService) {
        this.db = db;
        this.storageService = storageService;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, category, status, sortBy = "created_at", sortOrder = "desc" } = query;
        const offset = (page - 1) * limit;
        const filters = [];
        if (search) {
            filters.push((0, drizzle_orm_1.like)(schemas_1.events.title, `%${search}%`));
        }
        if (category) {
            filters.push((0, drizzle_orm_1.arrayContains)(schemas_1.events.categories, [category]));
        }
        if (status !== undefined) {
            filters.push((0, drizzle_orm_1.eq)(schemas_1.events.status, status ? 'ACTIVE' : 'INACTIVE'));
        }
        let orderByClause;
        if (sortBy === "created_at") {
            orderByClause = sortOrder === "desc" ? (0, drizzle_orm_1.desc)(schemas_1.events.created_at) : (0, drizzle_orm_1.asc)(schemas_1.events.created_at);
        }
        else if (sortBy === "title") {
            orderByClause = sortOrder === "desc" ? (0, drizzle_orm_1.desc)(schemas_1.events.title) : (0, drizzle_orm_1.asc)(schemas_1.events.title);
        }
        else if (sortBy === "id") {
            orderByClause = sortOrder === "desc" ? (0, drizzle_orm_1.desc)(schemas_1.events.id) : (0, drizzle_orm_1.asc)(schemas_1.events.id);
        }
        else {
            orderByClause = sortOrder === "desc" ? (0, drizzle_orm_1.desc)(schemas_1.events.created_at) : (0, drizzle_orm_1.asc)(schemas_1.events.created_at);
        }
        const whereClause = filters.length > 0 ? (0, drizzle_orm_1.and)(...filters) : undefined;
        const data = await this.db
            .select()
            .from(schemas_1.events)
            .where(whereClause || undefined)
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);
        const total = await this.db
            .select({ count: (0, drizzle_orm_1.count)() })
            .from(schemas_1.events)
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
            .from(schemas_1.events)
            .where((0, drizzle_orm_1.eq)(schemas_1.events.id, id))
            .then(results => results[0]);
        if (!venue) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found`);
        }
        return venue;
    }
    async create(createEventDto, created_by) {
        try {
            console.log(createEventDto.organizer_contacts);
            const eventImages = await this.uploadImages(createEventDto.event_images.map(image => ({ base64: image, isCover: false })));
            const ticketTypes = createEventDto.ticket_types.map(ticket => ({
                name: ticket.name,
                category: ticket.category,
                price: ticket.price,
                quantity: ticket.quantity,
                description: ticket.description,
                isPublished: ticket.isPublished,
            }));
            const organizerContacts = createEventDto.organizer_contacts.map(contact => ({
                type: contact.type,
                value: contact.value,
            }));
            const eventData = {
                title: createEventDto.title,
                description: createEventDto.description,
                categories: createEventDto.categories,
                date: new Date(createEventDto.date),
                start_time: createEventDto.start_time,
                end_time: createEventDto.end_time,
                place_name: createEventDto.place_name,
                latitude: createEventDto.latitude,
                longitude: createEventDto.longitude,
                organizer_name: createEventDto.organizer_name,
                organizer_contacts: organizerContacts,
                capacity: createEventDto.capacity,
                rsvp_required: createEventDto.rsvp_required,
                ticket_types: ticketTypes,
                currency: createEventDto.currency,
                event_images: eventImages,
                event_link: createEventDto.event_link,
                facebook_link: createEventDto.facebook_link,
                linkedin_link: createEventDto.linkedin_link,
                youtube_link: createEventDto.youtube_link,
                instagram_link: createEventDto.instagram_link,
                status: createEventDto.status,
                created_at: new Date(),
                created_by: created_by,
                updated_at: new Date(),
            };
            console.log(eventData, 'eventData');
            const result = await this.db
                .insert(schemas_1.events)
                .values(eventData)
                .returning();
            return eventData;
        }
        catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }
    async update(id, updateEventDto) {
        await this.findOne(id);
        try {
            const eventData = {
                updated_at: new Date()
            };
            if (updateEventDto.title !== undefined)
                eventData['title'] = updateEventDto.title;
            if (updateEventDto.description !== undefined)
                eventData['description'] = updateEventDto.description;
            if (updateEventDto.categories !== undefined)
                eventData['categories'] = updateEventDto.categories;
            if (updateEventDto.date !== undefined)
                eventData['date'] = new Date(updateEventDto.date);
            if (updateEventDto.start_time !== undefined)
                eventData['start_time'] = updateEventDto.start_time;
            if (updateEventDto.end_time !== undefined)
                eventData['end_time'] = updateEventDto.end_time;
            if (updateEventDto.place_name !== undefined)
                eventData['place_name'] = updateEventDto.place_name;
            if (updateEventDto.latitude !== undefined)
                eventData['latitude'] = updateEventDto.latitude;
            if (updateEventDto.longitude !== undefined)
                eventData['longitude'] = updateEventDto.longitude;
            if (updateEventDto.organizer_name !== undefined)
                eventData['organizer_name'] = updateEventDto.organizer_name;
            if (updateEventDto.organizer_contacts !== undefined)
                eventData['organizer_contacts'] = updateEventDto.organizer_contacts;
            if (updateEventDto.capacity !== undefined)
                eventData['capacity'] = updateEventDto.capacity;
            if (updateEventDto.rsvp_required !== undefined)
                eventData['rsvp_required'] = updateEventDto.rsvp_required;
            if (updateEventDto.ticket_types !== undefined)
                eventData['ticket_types'] = updateEventDto.ticket_types;
            if (updateEventDto.currency !== undefined)
                eventData['currency'] = updateEventDto.currency;
            if (updateEventDto.event_images !== undefined)
                eventData['event_images'] = updateEventDto.event_images;
            if (updateEventDto.event_link !== undefined)
                eventData['event_link'] = updateEventDto.event_link;
            if (updateEventDto.facebook_link !== undefined)
                eventData['facebook_link'] = updateEventDto.facebook_link;
            if (updateEventDto.linkedin_link !== undefined)
                eventData['linkedin_link'] = updateEventDto.linkedin_link;
            if (updateEventDto.youtube_link !== undefined)
                eventData['youtube_link'] = updateEventDto.youtube_link;
            if (updateEventDto.instagram_link !== undefined)
                eventData['instagram_link'] = updateEventDto.instagram_link;
            if (updateEventDto.status !== undefined)
                eventData['status'] = updateEventDto.status;
            const result = await this.db
                .update(schemas_1.events)
                .set(eventData)
                .where((0, drizzle_orm_1.eq)(schemas_1.events.id, id))
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        await this.db.delete(schemas_1.events).where((0, drizzle_orm_1.eq)(schemas_1.events.id, id));
        return { id };
    }
    async toggleStatus(id) {
        const event = await this.findOne(id);
        const result = await this.db
            .update(schemas_1.events)
            .set({
            status: !event.status,
            updated_at: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schemas_1.events.id, id))
            .returning();
        return result[0];
    }
    async uploadImages(images) {
        const uploadedImages = [];
        for (const image of images) {
            const uploadedImage = await this.storageService.uploadImage(image);
            uploadedImages.push({
                url: uploadedImage,
                isCover: image.isCover
            });
        }
        return uploadedImages;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE_CONNECTION')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase,
        storage_service_1.StorageService])
], EventsService);
//# sourceMappingURL=events.service.js.map