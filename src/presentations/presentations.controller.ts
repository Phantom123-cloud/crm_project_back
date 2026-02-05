import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PresentationsService } from './presentations.service';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import type { Request } from 'express';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';
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
    @Query('presentationTypeId') presentationTypeId: string,
    @Query('tripId') tripId: string,
  ) {
    return this.presentationsService.create(
      dto,
      tripId,
      presentationTypeId,
      req,
    );
  }

  @Get('all/:id')
  @HttpCode(HttpStatus.OK)
  allRoles(@Query() dto: PaginationBasic, @Param('id') id: string) {
    return this.presentationsService.allPresentations(dto, id);
  }
}
