import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class ChangeCoordinatorUsecase {
  constructor(private readonly prismaService: PrismaService) {}

  async changeCoordinator(presentationId: string, coordinatorId: string) {
    const [isExistPresentation, isExistUser] =
      await this.prismaService.$transaction([
        this.prismaService.presentations.findUnique({
          where: {
            id: presentationId,
          },

          select: {
            presentationTeams: true,
            trip: {
              select: {
                isActive: true,
              },
            },
          },
        }),
        this.prismaService.user.findUnique({
          where: {
            id: coordinatorId,
          },

          select: {
            employee: true,
          },
        }),
      ]);

    if (!isExistPresentation || !isExistUser) {
      throw new NotFoundException(
        !isExistPresentation ? 'Выезд не найден' : 'Пользователь не найден',
      );
    }

    if (!isExistPresentation.trip.isActive) {
      throw new ConflictException('Выезд заблокирован, изменения запрещены');
    }

    if (!isExistUser.employee?.isCoordinator) {
      throw new ConflictException(
        'Данный пользователь не является координатором',
      );
    }

    const currentCoordinatorId = isExistPresentation.presentationTeams.find(
      (item) => item.jobTitle === 'COORDINATOR',
    );

    if (currentCoordinatorId && currentCoordinatorId.id === coordinatorId) {
      throw new ConflictException('Вы передали почту текущего координатора');
    }

    await this.prismaService.$transaction(async (tx) => {
      if (currentCoordinatorId) {
        await tx.presentationTeam.update({
          where: {
            id: currentCoordinatorId.id,
          },
          data: {
            participantsUserId: coordinatorId,
          },
        });
      } else {
        await tx.presentationTeam.create({
          data: {
            jobTitle: 'COORDINATOR',
            presentationId,
            participantsUserId: coordinatorId,
          },
        });
      }

      return;
    });

    return buildResponse('Координатор изменён');
  }
}
