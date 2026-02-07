import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { PresentationsService } from './presentations.service';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import type { Request } from 'express';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UpdatePresentationDto } from './dto/update-presentation.dto copy';

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

  @Auth()
  @Put('update')
  @HttpCode(HttpStatus.CREATED)
  async update(
    @Req() req: Request,
    @Body() dto: UpdatePresentationDto,
    @Query('tripId') tripId: string,
    @Query('presentationId') presentationId: string,
    @Query('presentationTypeId') presentationTypeId?: string,
  ) {
    return this.presentationsService.update(
      dto,
      tripId,
      presentationId,
      req,
      presentationTypeId,
    );
  }

  @Get('all/:id')
  @HttpCode(HttpStatus.OK)
  allRoles(@Query() dto: PaginationBasic, @Param('id') id: string) {
    return this.presentationsService.allPresentations(dto, id);
  }

  @Get('by/:id')
  @HttpCode(HttpStatus.OK)
  presentationById(@Param('id') id: string) {
    return this.presentationsService.presentationById(id);
  }

  @Delete('by/:id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.presentationsService.delete(id);
  }
}
