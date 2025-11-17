import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { FilesService } from './files.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import path from 'path';
import fs from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // @Auth()
  // @Get('download/:fileName')
  // @HttpCode(HttpStatus.OK)
  // async downloadFile(
  //   @Res() res: Response,
  //   @Req() req: Request,
  //   @Param('fileName') fileName: string,
  // ) {
  //    await this.filesService.downloadsFile(req, res, fileName);
  // }
  @Auth()
  @Get('passports/:filename')
  async getPassport(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      'passports',
      filename,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Файл не обнаружен');
    }

    fs.createReadStream(filePath).pipe(res);
  }
}
