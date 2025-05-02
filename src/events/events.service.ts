import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { eq, and, like, arrayContains, desc, asc, count } from "drizzle-orm"
import { events, users, venues } from "../db/schemas"
import type { CreateEventDto, UpdateEventDto, EventQueryDto } from "./dtos/events.dto"
import { NodePgDatabase } from "drizzle-orm/node-postgres"
import * as schema from "../db/schemas"
import { StorageService } from "../storage/storage.service"

@Injectable()
export class EventsService {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private db: NodePgDatabase<typeof schema>,
        private storageService: StorageService
    ) { }

    async findAll(query: EventQueryDto) {
        const { page = 1, limit = 10, search, category, status, sortBy = "created_at", sortOrder = "desc" } = query
        const offset = (page - 1) * limit

        const filters = []

        if (search) {
            filters.push(like(events.title, `%${search}%`))
        }

        if (category) {
            // Handle array contains for PostgreSQL array
            filters.push(arrayContains(events.categories, [category]))
        }

        if (status !== undefined) {
            filters.push(eq(events.status, status ? 'ACTIVE' : 'INACTIVE'))
        }

        // Safe approach for sorting - default to created_at if invalid column
        let orderByClause;
        if (sortBy === "created_at") {
            orderByClause = sortOrder === "desc" ? desc(events.created_at) : asc(events.created_at);
        } else if (sortBy === "title") {
            orderByClause = sortOrder === "desc" ? desc(events.title) : asc(events.title);
        } else if (sortBy === "id") {
            orderByClause = sortOrder === "desc" ? desc(events.id) : asc(events.id);
        } else {
            // Default fallback
            orderByClause = sortOrder === "desc" ? desc(events.created_at) : asc(events.created_at);
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined

        // Using db.select().from() instead of db.query.venues.findMany()
        const data = await this.db
            .select()
            .from(events)
            .where(whereClause || undefined)
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);

        const total = await this.db
            .select({ count: count() })
            .from(events)
            .where(whereClause || undefined)
            .then((result) => Number(result[0].count))

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    async findOne(id: number) {
        // Use direct query instead of query builder
        const venue = await this.db
            .select()
            .from(events)
            .where(eq(events.id, id))
            .leftJoin(users, eq(events.created_by, users.id))

        if (!venue || venue.length === 0) {
            throw new NotFoundException(`Event with ID ${id} not found`)
        }
        // Create a new object with the venue data and creator field
        const venueWithCreator = {
            ...venue[0].events,
            creator: venue[0].users.first_name + ' ' + venue[0].users.last_name
        }

        return venueWithCreator
    }


    async create(createEventDto: CreateEventDto, created_by: number) {
        try {
            console.log(createEventDto.organizer_contacts)
            //get images and upload to storage and get the urls
            const eventImages = await this.uploadImages(createEventDto.event_images.map(image => ({base64: image, isCover: false})))

            const ticketTypes = createEventDto.ticket_types.map(ticket => ({
                name: ticket.name,
                category: ticket.category,
                price: ticket.price,
                quantity: ticket.quantity,
                description: ticket.description,
                isPublished: ticket.isPublished,
            }))

            const organizerContacts = createEventDto.organizer_contacts.map(contact => ({
                type: contact.type,
                value: contact.value,
            }))

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
                // map_location: createEventDto.map_location,
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

            console.log(eventData, 'eventData')
            const result = await this.db
                .insert(events)
                .values(eventData as any)
                .returning();
            
            return eventData;
            //result[0];
        } catch (error) {
            //axios error handling
            console.error('Error creating event:', error);
            throw error;
        }
    }

    async update(id: number, updateEventDto: UpdateEventDto) {
        // First check if venue exists
        await this.findOne(id);

        const eventImages = await this.uploadImages(
            updateEventDto.event_images.map((imageData) => (
                {
                    base64: imageData.base64 || imageData.url,
                    isCover: imageData.isCover
                }
            ))
        )

        try {
            const eventData = {
                updated_at: new Date()
            };

            // Only add fields that are present in the DTO
            if (updateEventDto.title !== undefined) eventData['title'] = updateEventDto.title;
            if (updateEventDto.description !== undefined) eventData['description'] = updateEventDto.description;
            if (updateEventDto.categories !== undefined) eventData['categories'] = updateEventDto.categories;
            if (updateEventDto.date !== undefined) eventData['date'] = new Date(updateEventDto.date);
            if (updateEventDto.start_time !== undefined) eventData['start_time'] = updateEventDto.start_time;
            if (updateEventDto.end_time !== undefined) eventData['end_time'] = updateEventDto.end_time;
            if (updateEventDto.place_name !== undefined) eventData['place_name'] = updateEventDto.place_name;
            if (updateEventDto.latitude !== undefined) eventData['latitude'] = updateEventDto.latitude;
            if (updateEventDto.longitude !== undefined) eventData['longitude'] = updateEventDto.longitude;
            if (updateEventDto.organizer_name !== undefined) eventData['organizer_name'] = updateEventDto.organizer_name;
            if (updateEventDto.organizer_contacts !== undefined) eventData['organizer_contacts'] = updateEventDto.organizer_contacts;
            if (updateEventDto.capacity !== undefined) eventData['capacity'] = updateEventDto.capacity;
            if (updateEventDto.rsvp_required !== undefined) eventData['rsvp_required'] = updateEventDto.rsvp_required;
            if (updateEventDto.ticket_types !== undefined) eventData['ticket_types'] = updateEventDto.ticket_types;
            if (updateEventDto.currency !== undefined) eventData['currency'] = updateEventDto.currency;
            if (updateEventDto.event_images !== undefined) eventData['event_images'] = eventImages;
            if (updateEventDto.event_link !== undefined) eventData['event_link'] = updateEventDto.event_link;
            if (updateEventDto.facebook_link !== undefined) eventData['facebook_link'] = updateEventDto.facebook_link;
            if (updateEventDto.linkedin_link !== undefined) eventData['linkedin_link'] = updateEventDto.linkedin_link;
            if (updateEventDto.youtube_link !== undefined) eventData['youtube_link'] = updateEventDto.youtube_link;
            if (updateEventDto.instagram_link !== undefined) eventData['instagram_link'] = updateEventDto.instagram_link;
            if (updateEventDto.status !== undefined) eventData['status'] = updateEventDto.status;
            // if (updateEventDto.created_by !== undefined) eventData['created_by'] = updateEventDto.created_by;
            
            const result = await this.db
                .update(events)
                .set(eventData as any)
                .where(eq(events.id, id))
                .returning();
            
            return result[0];
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    async remove(id: number) {
        // First check if venue exists
        await this.findOne(id);

        await this.db.delete(events).where(eq(events.id, id));

        return { id };
    }

    async uploadImages(images: {base64: string, isCover: boolean}[]) {
        const uploadedImages = [];
        for (const image of images) {
            const uploadedImage = await this.storageService.uploadImage(image);
            uploadedImages.push({
                url: uploadedImage,
                isCover: image.isCover
            })
        }
        return uploadedImages;
    }

    async getUserEvents(userId: number) {
        const events = await this.db.select().from(schema.events).where(eq(schema.events.created_by, userId));
        return events;
    }

}