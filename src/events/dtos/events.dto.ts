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
import { PartialType } from "@nestjs/mapped-types"

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsNotEmpty()
  categories: string[];

  // Location & Time
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  start_time: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;

  @IsString()
  @IsNotEmpty()
  place_name: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;


  @IsString()
  @IsNotEmpty()
  organizer_name: string;

  @IsArray()
  @IsNotEmpty()
  organizer_contacts: {
    type: string;
    value: string;
  }[];

  @IsString()
  @IsNotEmpty()
  capacity: string;

  @IsBoolean()
  @IsNotEmpty()
  rsvp_required: boolean;

  @IsArray()
  @IsNotEmpty()
  ticket_types: {
    name: string;
    category: string;
    price: number;
    quantity: number;
    description: string;
    isPublished: boolean;
  }[];

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsArray()
  @IsNotEmpty()
  event_images: string[];

  @IsOptional()
  event_link: string;

  @IsOptional()
  facebook_link: string;

  @IsOptional()
  linkedin_link: string;

  @IsOptional()
  youtube_link: string;

  @IsOptional()
  instagram_link: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}

//update same as create but not required
export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsArray()
  @IsOptional()
  event_images: any[];
}

  
  // Query DTO
  export class EventQueryDto {
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
    status?: boolean
  
    @IsOptional()
    @IsString()
    sortBy?: string
  
    @IsOptional()
    @IsString()
    sortOrder?: "asc" | "desc"
  }
  