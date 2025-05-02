import {
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsArray,
    ValidateNested,
    IsObject,
    Min,
    IsNotEmpty,
  } from "class-validator"
  import { Type } from "class-transformer"
  
  // Hall DTO
  class HallDto {
    @IsString()
    @IsNotEmpty()
    hall_name: string
  
    @IsString()
    @IsOptional()
    hall_description: string
  
    @IsNumber()
    @Min(1)
    hall_capacity: number
  
    @IsNumber()
    @Min(0)
    hall_price: number
  
    @IsBoolean()
    @IsOptional()
    hall_is_active = true
  }
  
  // Location DTO
  class LocationDto {
    @IsString()
    @IsNotEmpty()
    location_name: string
  
    @IsNumber()
    latitude: number
  
    @IsNumber()
    longitude: number
  }
  
  // Time Slot DTO
  class TimeSlotDto {
    @IsString()
    @IsNotEmpty()
    start_time: string
  
    @IsString()
    @IsNotEmpty()
    end_time: string
  }
  
  // Contact Info DTO
  class ContactInfoDto {
    @IsString()
    @IsNotEmpty()
    name: string
  
    @IsString()
    @IsNotEmpty()
    phone: string
  
    @IsString()
    @IsOptional()
    email: string
  
    @IsString()
    @IsNotEmpty()
    address: string
  }
  
  // Image DTO
  class ImageDto {
    @IsString()
    @IsNotEmpty()
    image_url: string
  
    @IsBoolean()
    @IsOptional()
    is_cover = false
  }
  
  // Base Venue DTO
  export class BaseVenueDto {
    @IsString()
    @IsNotEmpty()
    venue_name: string
  
    @IsString()
    @IsOptional()
    venue_description: string
  
    @IsBoolean()
    @IsOptional()
    is_active = true
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HallDto)
    @IsOptional()
    halls: HallDto[]
  
    @IsNumber()
    @IsOptional()
    @Min(0)
    start_price: number
  
    @IsNumber()
    @IsOptional()
    @Min(0)
    end_price: number
  
    @IsObject()
    @ValidateNested()
    @Type(() => LocationDto)
    @IsOptional()
    location: LocationDto
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeSlotDto)
    @IsOptional()
    time_slots: TimeSlotDto[]
  
    @IsArray()
    @ValidateNested()
    @Type(() => ContactInfoDto)
    @IsOptional()
    contact_info: ContactInfoDto
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    amenities: string[]
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    categories: string[]
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageDto)
    @IsOptional()
    images: ImageDto[]
  
    @IsBoolean()
    @IsOptional()
    is_disabled = false
  }
  
  // Create Venue DTO
  export class CreateVenueDto extends BaseVenueDto {
    @IsNumber()
    @IsOptional()
    created_by?: number;
  }
  
  // Update Venue DTO
  export class UpdateVenueDto extends BaseVenueDto {
    @IsNumber()
    @IsOptional()
    id?: number;

    @IsNumber()
    @IsOptional()
    created_by?: number;
    
  }
  
  // Query DTO
  export class VenueQueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number
  
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number
  
    @IsOptional()
    @IsString()
    search?: string
  
    @IsOptional()
    @IsString()
    category?: string
  
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean
  
    @IsOptional()
    @IsString()
    sortBy?: string
  
    @IsOptional()
    @IsString()
    sortOrder?: "asc" | "desc"
  }
  