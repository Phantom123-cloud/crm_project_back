import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Request, Response } from 'express';
import { JwtPayload } from 'src/token/interfaces/jwt-payload.interface';
import * as path from 'path';
import * as fs from 'fs';
import { FilesType } from '@prisma/client';
import { buildResponse } from 'src/utils/build-response';
import { UploadsService } from 'src/uploads/uploads.service';

@Injectable()
export class FilesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  private async fileExists(filePath: string) {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async createFileItemInDb(
    filePathArray: string[],
    employeesId: string,
    type: FilesType,
  ) {
    await this.prismaService.files.createMany({
      data: filePathArray.map((fileName) => ({
        fileName,
        type,
        employeesId,
      })),
    });
  }
  async downloadsFile(
    res: Response,
    fileName: string,
    userId: string,
    dir: string,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        token: true,
        employee: { select: { id: true } },
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');
    if (!user.employee || !user.token)
      throw new ConflictException('Нет доступа');

    const file = await this.prismaService.files.findUnique({
      where: {
        fileName,
        employeesId: user.employee.id,
      },
    });

    if (!file) {
      throw new NotFoundException('Файл отсутствует');
    }

    const filePath = path.join(process.cwd(), 'uploads', dir, fileName);
    const exists = await this.fileExists(filePath);

    if (!exists) {
      throw new NotFoundException('Файл отсутствует на сервера или был удалён');
    }

    res.download(filePath, fileName, (err) => {
      if (err) console.error('Ошибка при скачивании файла:', err);
    });
  }
  async deleteFile(fileName: string, userId: string, dir: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        token: true,
        employee: { select: { id: true } },
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');
    if (!user.employee || !user.token)
      throw new ConflictException('Нет доступа');

    const file = await this.prismaService.files.delete({
      where: {
        fileName,
        employeesId: user.employee.id,
      },
    });

    if (!file) {
      throw new NotFoundException('Файл отсутствует');
    }

    const filePath = path.join(process.cwd(), 'uploads', dir, fileName);
    const exists = await this.fileExists(filePath);

    if (!exists) {
      throw new NotFoundException('Файл отсутствует на сервера или был удалён');
    }

    await fs.promises.rm(filePath);
    return buildResponse('Данные удалены');
  }

  async importPasspostFiles(
    userId: string,
    files?: Array<Express.Multer.File>,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        employee: true,
        token: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    const currentFiles = await this.prismaService.files.findMany({
      where: {
        employeesId: user.employee.id,
        type: 'PASSPORT',
      },
    });

    if (files?.length) {
      if (currentFiles.length + files?.length > 10) {
        throw new ConflictException(
          'Максимальне к-во файлов на одного пользователя - 10',
        );
      }

      const filePathTask = this.uploadsService.seveFiles(files);
      await this.createFileItemInDb(filePathTask, user.employee.id, 'PASSPORT');
    }

    return buildResponse('Данные обновлены');
  }
}
