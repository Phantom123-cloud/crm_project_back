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
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateCitizenshipsDto } from './dto/create-citizenships.dto';
import { UpdateCitizenshipsDto } from './dto/update-citizenships.dto';

@Controller('citizenships')
export class CitizenshipsController {
  constructor(private readonly citizenshipsService: CitizenshipsService) {}

  // @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCitizenshipsDto) {
    return await this.citizenshipsService.create(dto);
  }

  // @Auth()
  @Get('all')
  @HttpCode(HttpStatus.CREATED)
  async countries() {
    return await this.citizenshipsService.countries();
  }

  @Put('update/:id')
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id') id: string, @Body() dto: UpdateCitizenshipsDto) {
    return await this.citizenshipsService.update(id, dto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.CREATED)
  async delete(@Param('id') id: string) {
    return await this.citizenshipsService.delete(id);
  }
}
