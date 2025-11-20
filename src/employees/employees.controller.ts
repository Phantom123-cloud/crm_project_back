import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { UpdateEmployeeFormDto } from './dto/update-employee-form.dto';
import { UpdateEmployeePassportDto } from './dto/update-employee-passport.dto';
import { AddContactNumberToEmployeeDto } from './dto/add-contact-number-to-employee.dto';
import { AddLanguageToEmployeeDto } from './dto/add-language-to-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // @AuthRoles('update_employee_forms')
  @Put('update-form/:id')
  @HttpCode(HttpStatus.OK)
  updateEmployeeForm(
    @Body() dto: Partial<UpdateEmployeeFormDto>,
    @Param('id') id: string,
  ) {
    return this.employeesService.updateEmployeeForm(dto, id);
  }

  // @AuthRoles('update_employee_passports')
  @Put('update-passport/:id')
  @HttpCode(HttpStatus.OK)
  updateEmployeePassport(
    @Body() dto: Partial<UpdateEmployeePassportDto>,
    @Param('id') id: string,
  ) {
    return this.employeesService.updateEmployeePassport(dto, id);
  }

  // @AuthRoles('disconnect_employee_citizenships')
  @Patch('disconnect-citizenship')
  @HttpCode(HttpStatus.OK)
  disconnectCitizenship(
    @Query('citizenshipId') citizenshipId: string,
    @Query('userId') userId: string,
  ) {
    return this.employeesService.disconnectCitizenship(citizenshipId, userId);
  }

  // @AuthRoles('add_contact_employee')
  @Post('add-contact/:id')
  @HttpCode(HttpStatus.OK)
  addContactNumberToEmployee(
    @Param('id') id: string,
    @Body() dto: AddContactNumberToEmployeeDto,
  ) {
    return this.employeesService.addContactNumberToEmployee(id, dto);
  }

  // @AuthRoles('add_language_employee')
  @Post('add-language/:id')
  @HttpCode(HttpStatus.OK)
  addLanguageToEmployee(
    @Param('id') id: string,
    @Body() dto: AddLanguageToEmployeeDto,
  ) {
    return this.employeesService.addLanguageToEmployee(id, dto);
  }

  // @AuthRoles('delete_language_employee')
  @Delete('delete-language')
  @HttpCode(HttpStatus.OK)
  deleteLanguageToEmployee(
    @Query('userId') userId: string,
    @Query('languageId') languageId: string,
  ) {
    return this.employeesService.deleteLanguageToEmployee(userId, languageId);
  }

  // @AuthRoles('delete_contact_employee')
  @Delete('delete-contact')
  @HttpCode(HttpStatus.OK)
  deleteContactNumberToEmployee(
    @Query('userId') userId: string,
    @Query('phoneId') phoneId: string,
  ) {
    return this.employeesService.deleteContactNumberToEmployee(userId, phoneId);
  }
}
