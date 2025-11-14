import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { UseUploadFiles } from 'src/uploads/decorators/upload-file.decorator';
import { UpdateEmployeeFormDto } from './dto/update-employee-form.dto';
import { UpdateEmployeePassportDto } from './dto/update-employee-passport.dto';
import { AddContactNumberToEmployeeDto } from './dto/add-contact-number-to-employee.dto';
import { AddLanguageToEmployeeDto } from './dto/add-language-to-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // @UploadedFiles() files: Array<Express.Multer.File>,

  // @Auth()
  @Put('update-form/:id')
  @HttpCode(HttpStatus.OK)
  // @UseUploadFiles(1, 10, 'passports', ['image/jpeg', 'image/png', 'image/webp'])
  updateEmployeeForm(
    @Body() dto: Partial<UpdateEmployeeFormDto>,
    @Param('id') id: string,
    // @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    return this.employeesService.updateEmployeeForm(dto, id);
  }

  @Put('update-passport/:id')
  @HttpCode(HttpStatus.OK)
  updateEmployeePassport(
    @Body() dto: Partial<UpdateEmployeePassportDto>,
    @Param('id') id: string,
  ) {
    return this.employeesService.updateEmployeePassport(dto, id);
  }

  @Patch('disconnect-citizenship')
  @HttpCode(HttpStatus.OK)
  disconnectCitizenship(
    @Query('citizenshipId') citizenshipId: string,
    @Query('userId') userId: string,
  ) {
    return this.employeesService.disconnectCitizenship(citizenshipId, userId);
  }

  @Post('add-contact/:id')
  @HttpCode(HttpStatus.OK)
  addContactNumberToEmployee(
    @Param('id') id: string,
    @Body() dto: AddContactNumberToEmployeeDto,
  ) {
    return this.employeesService.addContactNumberToEmployee(id, dto);
  }

  @Post('add-language/:id')
  @HttpCode(HttpStatus.OK)
  addLanguageToEmployee(
    @Param('id') id: string,
    @Body() dto: AddLanguageToEmployeeDto,
  ) {
    return this.employeesService.addLanguageToEmployee(id, dto);
  }

  @Delete('delete-language')
  @HttpCode(HttpStatus.OK)
  deleteLanguageToEmployee(
    @Query('userId') userId: string,
    @Query('languageId') languageId: string,
  ) {
    return this.employeesService.deleteLanguageToEmployee(userId, languageId);
  }

  @Delete('delete-contact')
  @HttpCode(HttpStatus.OK)
  deleteContactNumberToEmployee(
    @Query('userId') userId: string,
    @Query('phoneId') phoneId: string,
  ) {
    return this.employeesService.deleteContactNumberToEmployee(userId, phoneId);
  }
}
