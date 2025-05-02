export declare class CreateEventDto {
    title: string;
    description: string;
    categories: string[];
    date: string;
    start_time: string;
    end_time: string;
    place_name: string;
    latitude: number;
    longitude: number;
    organizer_name: string;
    organizer_contacts: {
        type: string;
        value: string;
    }[];
    capacity: string;
    rsvp_required: boolean;
    ticket_types: {
        name: string;
        category: string;
        price: number;
        quantity: number;
        description: string;
        isPublished: boolean;
    }[];
    currency: string;
    event_images: string[];
    event_link: string;
    facebook_link: string;
    linkedin_link: string;
    youtube_link: string;
    instagram_link: string;
    status: string;
}
declare const UpdateEventDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateEventDto>>;
export declare class UpdateEventDto extends UpdateEventDto_base {
}
export declare class EventQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export {};
