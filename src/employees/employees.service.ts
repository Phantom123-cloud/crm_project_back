import { Injectable } from '@nestjs/common';
import { UpdateEmployeeFormDto } from './dto/update-employee-form.dto';
import { UpdateEmployeePassportDto } from './dto/update-employee-passport.dto';
import { AddLanguageToEmployeeDto } from './dto/add-language-to-employee.dto';
import { AddContactNumberToEmployeeDto } from './dto/add-contact-number-to-employee.dto';
import { UpdateEmployeeUseCase } from './use-cases/update-employee-form.usecase';
import { EmployeeCitizenshipUseCase } from './use-cases/disconnect-citizenship.usecase';
import { AddEmployeeFieldsUseCase } from './use-cases/add-employee-fields.usecase';
import { DeleteEmployeeFieldsUseCase } from './use-cases/delete-employee-fields.usecase';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly updateEmployeeUseCase: UpdateEmployeeUseCase,
    private readonly employeeCitizenshipUseCase: EmployeeCitizenshipUseCase,
    private readonly addEmployeeFieldsUseCase: AddEmployeeFieldsUseCase,
    private readonly deleteEmployeeFieldsUseCase: DeleteEmployeeFieldsUseCase,
  ) {}

  async updateEmployeeForm(
    dto: Partial<UpdateEmployeeFormDto>,
    userId: string,
  ) {
    return this.updateEmployeeUseCase.updateEmployeeForm(dto, userId);
  }
  async updateEmployeePassport(
    dto: Partial<UpdateEmployeePassportDto>,
    userId: string,
  ) {
    return this.updateEmployeeUseCase.updateEmployeePassport(dto, userId);
  }
  async disconnectCitizenship(citizenshipId: string, userId: string) {
    return this.employeeCitizenshipUseCase.disconnectCitizenship(
      citizenshipId,
      userId,
    );
  }

  async addLanguageToEmployee(userId: string, dto: AddLanguageToEmployeeDto) {
    return this.addEmployeeFieldsUseCase.addLanguage(userId, dto);
  }
  async addContactNumberToEmployee(
    userId: string,
    dto: AddContactNumberToEmployeeDto,
  ) {
    return this.addEmployeeFieldsUseCase.addContactNumber(userId, dto);
  }

  async deleteContactNumberToEmployee(userId: string, phoneId: string) {
    return this.deleteEmployeeFieldsUseCase.deleteContactNumber(
      userId,
      phoneId,
    );
  }
  async deleteLanguageToEmployee(userId: string, languageId: string) {
    return this.deleteEmployeeFieldsUseCase.deleteLanguage(userId, languageId);
  }
}
