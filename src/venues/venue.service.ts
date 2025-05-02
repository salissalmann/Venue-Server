import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { eq, and, like, arrayContains, desc, asc, count } from "drizzle-orm"
import { venues } from "../db/schemas"
import type { CreateVenueDto, UpdateVenueDto, VenueQueryDto } from "./dtos/venue.dto"
import { NodePgDatabase } from "drizzle-orm/node-postgres"
import * as schema from "../db/schemas"

@Injectable()
export class VenuesService {
    constructor(
        @Inject('DATABASE_CONNECTION')
        private db: NodePgDatabase<typeof schema>,
    ) { }

    async findAll(query: VenueQueryDto) {
        const { page = 1, limit = 10, search, category, isActive, sortBy = "created_at", sortOrder = "desc" } = query
        const offset = (page - 1) * limit

        const filters = []

        if (search) {
            filters.push(like(venues.venue_name, `%${search}%`))
        }

        if (category) {
            // Handle array contains for PostgreSQL array
            filters.push(arrayContains(venues.categories, [category]))
        }

        if (isActive !== undefined) {
            filters.push(eq(venues.is_active, isActive))
        }

        // Safe approach for sorting - default to created_at if invalid column
        let orderByClause;
        if (sortBy === "created_at") {
            orderByClause = sortOrder === "desc" ? desc(venues.created_at) : asc(venues.created_at);
        } else if (sortBy === "venue_name") {
            orderByClause = sortOrder === "desc" ? desc(venues.venue_name) : asc(venues.venue_name);
        } else if (sortBy === "id") {
            orderByClause = sortOrder === "desc" ? desc(venues.id) : asc(venues.id);
        } else {
            // Default fallback
            orderByClause = sortOrder === "desc" ? desc(venues.created_at) : asc(venues.created_at);
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined

        // Using db.select().from() instead of db.query.venues.findMany()
        const data = await this.db
            .select()
            .from(venues)
            .where(whereClause || undefined)
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);

        const total = await this.db
            .select({ count: count() })
            .from(venues)
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
            .from(venues)
            .where(eq(venues.id, id))
            .then(results => results[0]);

        if (!venue) {
            throw new NotFoundException(`Venue with ID ${id} not found`)
        }

        return venue
    }

    async create(createVenueDto: CreateVenueDto) {
        try {
            const venueData = {
                venue_name: createVenueDto.venue_name,
                venue_description: createVenueDto.venue_description,
                is_active: createVenueDto.is_active,
                created_by: createVenueDto.created_by,
                created_at: new Date(),
                updated_at: new Date()
            };

            // Add non-primitive values if they exist
            if (createVenueDto.halls) venueData['halls'] = createVenueDto.halls;
            if (createVenueDto.start_price) venueData['start_price'] = createVenueDto.start_price;
            if (createVenueDto.end_price) venueData['end_price'] = createVenueDto.end_price;
            if (createVenueDto.location) venueData['location'] = createVenueDto.location;
            if (createVenueDto.time_slots) venueData['time_slots'] = createVenueDto.time_slots;
            if (createVenueDto.contact_info) venueData['contact_info'] = createVenueDto.contact_info;
            if (createVenueDto.amenities) venueData['amenities'] = createVenueDto.amenities;
            if (createVenueDto.categories) venueData['categories'] = createVenueDto.categories;
            if (createVenueDto.images) venueData['images'] = createVenueDto.images;
            if (createVenueDto.is_disabled !== undefined) venueData['is_disabled'] = createVenueDto.is_disabled;

            const result = await this.db
                .insert(venues)
                .values(venueData as any)
                .returning();
            
            return result[0];
        } catch (error) {
            console.error('Error creating venue:', error);
            throw error;
        }
    }

    async update(id: number, updateVenueDto: UpdateVenueDto) {
        // First check if venue exists
        await this.findOne(id);

        try {
            const venueData = {
                updated_at: new Date()
            };

            // Only add fields that are present in the DTO
            if (updateVenueDto.venue_name !== undefined) venueData['venue_name'] = updateVenueDto.venue_name;
            if (updateVenueDto.venue_description !== undefined) venueData['venue_description'] = updateVenueDto.venue_description;
            if (updateVenueDto.is_active !== undefined) venueData['is_active'] = updateVenueDto.is_active;
            if (updateVenueDto.halls !== undefined) venueData['halls'] = updateVenueDto.halls;
            if (updateVenueDto.start_price !== undefined) venueData['start_price'] = updateVenueDto.start_price;
            if (updateVenueDto.end_price !== undefined) venueData['end_price'] = updateVenueDto.end_price;
            if (updateVenueDto.location !== undefined) venueData['location'] = updateVenueDto.location;
            if (updateVenueDto.time_slots !== undefined) venueData['time_slots'] = updateVenueDto.time_slots;
            if (updateVenueDto.contact_info !== undefined) venueData['contact_info'] = updateVenueDto.contact_info;
            if (updateVenueDto.amenities !== undefined) venueData['amenities'] = updateVenueDto.amenities;
            if (updateVenueDto.categories !== undefined) venueData['categories'] = updateVenueDto.categories;
            if (updateVenueDto.images !== undefined) venueData['images'] = updateVenueDto.images;
            if (updateVenueDto.is_disabled !== undefined) venueData['is_disabled'] = updateVenueDto.is_disabled;
            if (updateVenueDto.created_by !== undefined) venueData['created_by'] = updateVenueDto.created_by;

            const result = await this.db
                .update(venues)
                .set(venueData as any)
                .where(eq(venues.id, id))
                .returning();
            
            return result[0];
        } catch (error) {
            console.error('Error updating venue:', error);
            throw error;
        }
    }

    async remove(id: number) {
        // First check if venue exists
        await this.findOne(id);

        await this.db.delete(venues).where(eq(venues.id, id));

        return { id };
    }

    async toggleStatus(id: number) {
        const venue = await this.findOne(id);

        const result = await this.db
            .update(venues)
            .set({
                is_active: !venue.is_active,
                updated_at: new Date(),
            } as any)
            .where(eq(venues.id, id))
            .returning();

        return result[0];
    }

    async findByCategory(category: string, query: VenueQueryDto) {
        // Reuse the findAll method but ensure category is set
        const queryWithCategory = {
            ...query,
            category
        };
        
        return this.findAll(queryWithCategory);
    }

    async findAllKarachiAreas() {
        try {
            const API_KEY = "AIzaSyDxt2Y8RUrRTqT_kxbLeygxgjvVlXI5Dbo"
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=neighborhoods+in+Karachi&key=${API_KEY}`)            
            return response.json()
        } catch (error) {
            console.error('Error fetching Karachi areas:', error);
            throw error;
        }
    }

    async userVenues(userId: number) {
        try {
            const venues = await this.db.select().from(schema.venues).where(eq(schema.venues.created_by, userId));
            return venues;
        } catch (error) {
            console.error('Error fetching user venues:', error);
            throw error;
        }
    }
}