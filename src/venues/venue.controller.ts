import { Controller, Get, Post, Put, Delete, Body, Param, Query, ValidationPipe, ParseIntPipe, UseGuards, Req, HttpException, HttpStatus, Res } from "@nestjs/common"
import { VenuesService } from "./venue.service"
import { CreateVenueDto, UpdateVenueDto, VenueQueryDto } from "./dtos/venue.dto"
import { JwtAuthGuard } from "../auth/jwt.guard"
import { Request, Response } from "express"

// Define the Request with user property
interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string;
  };
}

@Controller("venues")
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get()
  async findAll(@Query() query: VenueQueryDto) {
    return this.venuesService.findAll(query);
  }

  //get user venues
  @Get('vendor-venues')
  @UseGuards(JwtAuthGuard)
  async userVenues(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      const venues = await this.venuesService.userVenues(req.user.id);
      if (venues.length > 0) {
        return res.status(HttpStatus.OK).json(venues);
      } else {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'No venues found' });
      }
    } catch (error) {
      throw new HttpException('Error fetching user venues', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('get-all-karachi-areas')
  async areas() {
    try {
      return this.venuesService.findAllKarachiAreas();
    } catch (error) {
      throw new HttpException('Error fetching Karachi areas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.venuesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body(ValidationPipe) createVenueDto: CreateVenueDto, @Req() req: RequestWithUser) {
    // Add the authenticated user's ID as the creator
    createVenueDto.created_by = req.user.id;
    return this.venuesService.create(createVenueDto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateVenueDto: UpdateVenueDto) {
    return this.venuesService.update(id, updateVenueDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.venuesService.remove(id);
  }

  @Put(':id/toggle-status')
  @UseGuards(JwtAuthGuard)
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.venuesService.toggleStatus(id);
  }
}
