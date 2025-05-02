import { VenuesService } from "./venue.service";
import { CreateVenueDto, UpdateVenueDto, VenueQueryDto } from "./dtos/venue.dto";
import { Request, Response } from "express";
interface RequestWithUser extends Request {
    user: {
        id: number;
        username: string;
    };
}
export declare class VenuesController {
    private readonly venuesService;
    constructor(venuesService: VenuesService);
    findAll(query: VenueQueryDto): Promise<{
        data: {
            id: number;
            venue_name: string;
            venue_description: string;
            is_active: boolean;
            halls: {
                hall_name: string;
                hall_description: string;
                hall_capacity: number;
                hall_price: number;
                hall_is_active: boolean;
            }[];
            start_price: number;
            end_price: number;
            location: {
                location_name: string;
                latitude: number;
                longitude: number;
            };
            time_slots: {
                start_time: typeof import("drizzle-orm/pg-core").time;
                end_time: typeof import("drizzle-orm/pg-core").time;
            }[];
            contact_info: {
                name: string;
                phone: string;
                email: string;
                address: string;
            }[];
            amenities: string[];
            categories: string[];
            images: {
                image_url: string;
                is_cover: boolean;
            }[];
            is_disabled: boolean;
            created_by: number;
            created_at: Date;
            updated_at: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    userVenues(req: RequestWithUser, res: Response): Promise<Response<any, Record<string, any>>>;
    areas(): Promise<any>;
    findOne(id: number): Promise<{
        id: number;
        venue_name: string;
        venue_description: string;
        is_active: boolean;
        halls: {
            hall_name: string;
            hall_description: string;
            hall_capacity: number;
            hall_price: number;
            hall_is_active: boolean;
        }[];
        start_price: number;
        end_price: number;
        location: {
            location_name: string;
            latitude: number;
            longitude: number;
        };
        time_slots: {
            start_time: typeof import("drizzle-orm/pg-core").time;
            end_time: typeof import("drizzle-orm/pg-core").time;
        }[];
        contact_info: {
            name: string;
            phone: string;
            email: string;
            address: string;
        }[];
        amenities: string[];
        categories: string[];
        images: {
            image_url: string;
            is_cover: boolean;
        }[];
        is_disabled: boolean;
        created_by: number;
        created_at: Date;
        updated_at: Date;
    }>;
    create(createVenueDto: CreateVenueDto, req: RequestWithUser): Promise<{
        id: number;
        is_disabled: boolean;
        created_at: Date;
        updated_at: Date;
        venue_name: string;
        venue_description: string;
        is_active: boolean;
        halls: {
            hall_name: string;
            hall_description: string;
            hall_capacity: number;
            hall_price: number;
            hall_is_active: boolean;
        }[];
        start_price: number;
        end_price: number;
        location: {
            location_name: string;
            latitude: number;
            longitude: number;
        };
        time_slots: {
            start_time: typeof import("drizzle-orm/pg-core").time;
            end_time: typeof import("drizzle-orm/pg-core").time;
        }[];
        contact_info: {
            name: string;
            phone: string;
            email: string;
            address: string;
        }[];
        amenities: string[];
        categories: string[];
        images: {
            image_url: string;
            is_cover: boolean;
        }[];
        created_by: number;
    }>;
    update(id: number, updateVenueDto: UpdateVenueDto): Promise<{
        id: number;
        venue_name: string;
        venue_description: string;
        is_active: boolean;
        halls: {
            hall_name: string;
            hall_description: string;
            hall_capacity: number;
            hall_price: number;
            hall_is_active: boolean;
        }[];
        start_price: number;
        end_price: number;
        location: {
            location_name: string;
            latitude: number;
            longitude: number;
        };
        time_slots: {
            start_time: typeof import("drizzle-orm/pg-core").time;
            end_time: typeof import("drizzle-orm/pg-core").time;
        }[];
        contact_info: {
            name: string;
            phone: string;
            email: string;
            address: string;
        }[];
        amenities: string[];
        categories: string[];
        images: {
            image_url: string;
            is_cover: boolean;
        }[];
        is_disabled: boolean;
        created_by: number;
        created_at: Date;
        updated_at: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
    }>;
    toggleStatus(id: number): Promise<{
        id: number;
        venue_name: string;
        venue_description: string;
        is_active: boolean;
        halls: {
            hall_name: string;
            hall_description: string;
            hall_capacity: number;
            hall_price: number;
            hall_is_active: boolean;
        }[];
        start_price: number;
        end_price: number;
        location: {
            location_name: string;
            latitude: number;
            longitude: number;
        };
        time_slots: {
            start_time: typeof import("drizzle-orm/pg-core").time;
            end_time: typeof import("drizzle-orm/pg-core").time;
        }[];
        contact_info: {
            name: string;
            phone: string;
            email: string;
            address: string;
        }[];
        amenities: string[];
        categories: string[];
        images: {
            image_url: string;
            is_cover: boolean;
        }[];
        is_disabled: boolean;
        created_by: number;
        created_at: Date;
        updated_at: Date;
    }>;
}
export {};
