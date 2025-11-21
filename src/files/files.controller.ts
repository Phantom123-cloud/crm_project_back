import {
  Controller,
  Get,
  Param,
  Res,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
  Post,
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import path from 'path';
import fs from 'fs';
import { UseUploadFiles } from 'src/uploads/decorators/upload-file.decorator';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Auth()
  @AuthRoles('download_employee_passports')
  @Get('download/passports')
  @HttpCode(HttpStatus.OK)
  async downloadFile(
    @Res() res: Response,
    @Query('fileName') fileName: string,
    @Query('userId') userId: string,
  ) {
    await this.filesService.downloadsFile(res, fileName, userId, 'passports');
  }

  @AuthRoles('import_employee_passports')
  @Post('import-passport/:id')
  @HttpCode(HttpStatus.CREATED)
  @UseUploadFiles(1, 10, 'passports', ['image/jpeg', 'image/png', 'image/webp'])
  async importPasspostFiles(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.filesService.importPasspostFiles(id, files);
  }

  @AuthRoles('delete_employee_passports')
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  async deleteFile(
    @Query('fileName') fileName: string,
    @Query('userId') userId: string,
  ) {
    return await this.filesService.deleteFile(fileName, userId, 'passports');
  }

  @AuthRoles('view_employee_passports')
  @Get('passports/:filename')
  async getPassport(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'uploads', 'passports', filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Файл не обнаружен');
    }

    fs.createReadStream(filePath).pipe(res);
  }
}
