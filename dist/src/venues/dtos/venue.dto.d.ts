declare class HallDto {
    hall_name: string;
    hall_description: string;
    hall_capacity: number;
    hall_price: number;
    hall_is_active: boolean;
}
declare class LocationDto {
    location_name: string;
    latitude: number;
    longitude: number;
}
declare class TimeSlotDto {
    start_time: string;
    end_time: string;
}
declare class ContactInfoDto {
    name: string;
    phone: string;
    email: string;
    address: string;
}
declare class ImageDto {
    image_url: string;
    is_cover: boolean;
}
export declare class BaseVenueDto {
    venue_name: string;
    venue_description: string;
    is_active: boolean;
    halls: HallDto[];
    start_price: number;
    end_price: number;
    location: LocationDto;
    time_slots: TimeSlotDto[];
    contact_info: ContactInfoDto;
    amenities: string[];
    categories: string[];
    images: ImageDto[];
    is_disabled: boolean;
}
export declare class CreateVenueDto extends BaseVenueDto {
    created_by?: number;
}
export declare class UpdateVenueDto extends BaseVenueDto {
    id?: number;
    created_by?: number;
}
export declare class VenueQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export {};
