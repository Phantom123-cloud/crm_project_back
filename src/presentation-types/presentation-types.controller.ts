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
} from '@nestjs/common';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';
import { PresentationTypesService } from './presentation-types.service';
import { CreatePresentationTypesDto } from './dto/create-presentation-types.dto';
import { UpdatePresentationTypesDto } from './dto/update-presentation-types.dto';

@Controller('presentation-types')
export class PresentationTypesController {
  constructor(
    private readonly presentationTypesService: PresentationTypesService,
  ) {}

  // @AuthRoles('create_trip_types')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePresentationTypesDto) {
    return this.presentationTypesService.create(dto);
  }

  // @AuthRoles('view_presentation_types')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async all(@Query() dto: PaginationBasic) {
    return this.presentationTypesService.all(dto);
  }

  // для создания выезда
  // @AuthRoles('create_trips')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allSelect() {
    return this.presentationTypesService.allSelect();
  }

  // @AuthRoles('update_trip_types')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePresentationTypesDto,
  ) {
    return this.presentationTypesService.update(id, dto);
  }

  // @AuthRoles('delete_trip_types')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.presentationTypesService.delete(id);
  }
}
