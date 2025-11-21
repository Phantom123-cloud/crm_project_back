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
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @AuthRoles('create_languages')
  @Post('create')
  async create(@Body() dto: CreateLanguageDto) {
    return await this.languagesService.create(dto);
  }

  @AuthRoles('view_languages')
  @Get('all')
  async all() {
    return await this.languagesService.all();
  }

  @AuthRoles('update_languages')
  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return await this.languagesService.update(id, dto);
  }

  @AuthRoles('delete_languages')
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.languagesService.delete(id);
  }
}
