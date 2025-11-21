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
    return await this.citizenshipsService.create(dto);
  }

  @AuthRoles('view_citizenships')
  @Get('all')
  @HttpCode(HttpStatus.CREATED)
  async all() {
    return await this.citizenshipsService.all();
  }

  @AuthRoles('update_citizenships')
  @Put('update/:id')
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id') id: string, @Body() dto: UpdateCitizenshipsDto) {
    return await this.citizenshipsService.update(id, dto);
  }

  @AuthRoles('delete_citizenships')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.CREATED)
  async delete(@Param('id') id: string) {
    return await this.citizenshipsService.delete(id);
  }
}
