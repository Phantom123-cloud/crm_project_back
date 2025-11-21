import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { UsersModule } from 'src/users/users.module';
import { EmployeesRepository } from './employees.repositories';
import { ImportedFildsUseCase } from './use-cases/imported-fields.usecase';
import { UpdateEmployeeUseCase } from './use-cases/update-employee-form.usecase';
import { AddEmployeeFieldsUseCase } from './use-cases/add-employee-fields.usecase';
import { DeleteEmployeeFieldsUseCase } from './use-cases/delete-employee-fields.usecase';
import { EmployeeCitizenshipUseCase } from './use-cases/disconnect-citizenship.usecase';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    EmployeesRepository,
    ImportedFildsUseCase,
    UpdateEmployeeUseCase,
    AddEmployeeFieldsUseCase,
    DeleteEmployeeFieldsUseCase,
    EmployeeCitizenshipUseCase,
    RolesDataBuilder,
    UsersRepository,
  ],
  imports: [UsersModule],
})
export class EmployeesModule {}
