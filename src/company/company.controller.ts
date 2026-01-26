import { CompanyService } from './company.service';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';
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
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // @AuthRoles('create_cities')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  // @AuthRoles('view_cities')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async all(@Query() dto: PaginationBasic) {
    return this.companyService.all(dto);
  }

  // @AuthRoles('update_employee')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allSelect(@Query('tripId') tripId?: string) {
    return this.companyService.allSelect(tripId);
  }

  // @AuthRoles('update_cities')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(id, dto);
  }

  // @AuthRoles('delete_cities')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.companyService.delete(id);
  }
}
