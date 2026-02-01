import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PresentationsService } from './presentations.service';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import type { Request } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('presentations')
export class PresentationsController {
  constructor(private readonly presentationsService: PresentationsService) {}

  @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @Body() dto: CreatePresentationDto,
    @Query('tripId') tripId: string,
  ) {
    return this.presentationsService.create(dto, tripId, req);
  }
}
