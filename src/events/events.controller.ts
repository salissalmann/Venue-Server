import { Controller, Get, Post, Put, Delete, Body, Param, Query, ValidationPipe, ParseIntPipe, UseGuards, Req } from "@nestjs/common"
import { EventsService } from "./events.service"
import { CreateEventDto, EventQueryDto, UpdateEventDto } from "./dtos/events.dto"
import { JwtAuthGuard } from "../auth/jwt.guard"
import { Request } from "express"

// Define the Request with user property
interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string;
  };
}

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Get('vendor-events')
  @UseGuards(JwtAuthGuard)
  async getUserEvents(@Req() req: RequestWithUser) {
    return this.eventsService.getUserEvents(req.user.id);
  }

  @Get()
  async findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body(ValidationPipe) createEventDto: CreateEventDto, @Req() req: RequestWithUser) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateEventDto: UpdateEventDto, @Req() req: RequestWithUser) {
    return this.eventsService.update(id, updateEventDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }


}
