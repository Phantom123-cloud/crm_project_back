import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CitizenshipsService } from './citizenships.service';
import { CreateCitizenshipsDto } from './dto/create-citizenships.dto';
import { UpdateCitizenshipsDto } from './dto/update-citizenships.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';

@Controller('citizenships')
export class CitizenshipsController {
  constructor(private readonly citizenshipsService: CitizenshipsService) {}

  @AuthRoles('create_citizenships')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCitizenshipsDto) {
    return this.citizenshipsService.create(dto);
  }

  @AuthRoles('view_citizenships')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async all(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.citizenshipsService.all(page, limit);
  }

  @AuthRoles('update_employee')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allSelect() {
    return this.citizenshipsService.allSelect();
  }

  @AuthRoles('update_citizenships')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateCitizenshipsDto) {
    return this.citizenshipsService.update(id, dto);
  }

  @AuthRoles('delete_citizenships')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.citizenshipsService.delete(id);
  }
}
