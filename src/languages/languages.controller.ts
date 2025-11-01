import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post('create')
  async create(@Body() dto: CreateLanguageDto) {
    return await this.languagesService.create(dto);
  }

  @Get('all')
  async findAll() {
    return await this.languagesService.languages();
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return await this.languagesService.update(id, dto);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.languagesService.delete(id);
  }
}
