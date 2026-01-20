import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
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
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @AuthRoles('update_employee')
  @Put('update-form/:id')
  @HttpCode(HttpStatus.OK)
  updateEmployeeForm(
    @Body() dto: Partial<UpdateEmployeeFormDto>,
    @Param('id') id: string,
  ) {
    return this.employeesService.updateEmployeeForm(dto, id);
  }

  @AuthRoles('update_employee')
  @Put('update-passport/:id')
  @HttpCode(HttpStatus.OK)
  updateEmployeePassport(
    @Body() dto: Partial<UpdateEmployeePassportDto>,
    @Param('id') id: string,
  ) {
    return this.employeesService.updateEmployeePassport(dto, id);
  }

  @AuthRoles('update_employee')
  @Patch('disconnect-citizenship')
  @HttpCode(HttpStatus.OK)
  disconnectCitizenship(
    @Query('citizenshipId') citizenshipId: string,
    @Query('userId') userId: string,
  ) {
    return this.employeesService.disconnectCitizenship(citizenshipId, userId);
  }

  @AuthRoles('update_employee')
  @Post('add-contact/:id')
  @HttpCode(HttpStatus.OK)
  addContactNumberToEmployee(
    @Param('id') id: string,
    @Body() dto: AddContactNumberToEmployeeDto,
  ) {
    return this.employeesService.addContactNumberToEmployee(id, dto);
  }

  @AuthRoles('update_employee')
  @Post('add-language/:id')
  @HttpCode(HttpStatus.OK)
  addLanguageToEmployee(
    @Param('id') id: string,
    @Body() dto: AddLanguageToEmployeeDto,
  ) {
    return this.employeesService.addLanguageToEmployee(id, dto);
  }

  @AuthRoles('update_employee')
  @Delete('delete-language')
  @HttpCode(HttpStatus.OK)
  deleteLanguageToEmployee(
    @Query('userId') userId: string,
    @Query('languageId') languageId: string,
  ) {
    return this.employeesService.deleteLanguageToEmployee(userId, languageId);
  }

  @AuthRoles('update_employee')
  @Delete('delete-contact')
  @HttpCode(HttpStatus.OK)
  deleteContactNumberToEmployee(
    @Query('userId') userId: string,
    @Query('phoneId') phoneId: string,
  ) {
    return this.employeesService.deleteContactNumberToEmployee(userId, phoneId);
  }

  // @AuthRoles('update_employee')
  @Get('coordinators')
  @HttpCode(HttpStatus.OK)
  allCoordinators() {
    return this.employeesService.allCoordinators();
  }

  @AuthRoles('create_warehouses', 'change_owner_warehouse')
  @Get('all-employee-tradings')
  @HttpCode(HttpStatus.OK)
  allEmployeeTradings(
    @Query('isNotAll', ParseBoolPipe) isNotAll: boolean,
    @Query('isViewWarehouses', new ParseBoolPipe({ optional: true }))
    isViewWarehouses: boolean,
  ) {
    return this.employeesService.allEmployeeTradings(
      isNotAll,
      isViewWarehouses,
    );
  }
}
