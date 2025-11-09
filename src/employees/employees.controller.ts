import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UploadedFiles,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeeUpdateDto } from './dto/employee-update-dto';
import { UseUploadFiles } from 'src/uploads/decorators/upload-file.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // @UploadedFiles() files: Array<Express.Multer.File>,

  // @Auth()
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  @UseUploadFiles(1, 10, 'passports', ['image/jpeg', 'image/png', 'image/webp'])
  updateEmployees(
    @Body() dto: Partial<EmployeeUpdateDto>,
    @Param('id') id: string,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    return this.employeesService.updateEmployees(dto, id, files);
  }
}
