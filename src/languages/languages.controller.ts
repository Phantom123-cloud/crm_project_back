import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
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
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateLanguageDto) {
    return this.languagesService.create(dto);
  }

  @AuthRoles('view_languages')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async all(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.languagesService.all(page, limit);
  }

  @AuthRoles('view_citizenships')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allSelect() {
    return this.languagesService.allSelect();
  }

  @AuthRoles('update_languages')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return this.languagesService.update(id, dto);
  }

  @AuthRoles('delete_languages')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.languagesService.delete(id);
  }
}
