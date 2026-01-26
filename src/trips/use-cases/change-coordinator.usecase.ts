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

  async changeCoordinator(tripId: string, coordinatorId: string) {
    const [isExistTrip, isExistUser] = await this.prismaService.$transaction([
      this.prismaService.trip.findUnique({
        where: {
          id: tripId,
        },

        select: {
          baseTeamParticipants: true,
        },
      }),
      this.prismaService.user.findUnique({
        where: {
          id: coordinatorId,
        },
      }),
    ]);

    if (!isExistTrip || !isExistUser) {
      throw new NotFoundException(
        !isExistTrip ? 'Выезд не найден' : 'Пользователь не найден',
      );
    }

    const currentCoordinatorId = isExistTrip.baseTeamParticipants.find(
      (item) => item.jobTitle === 'COORDINATOR',
    );

    if (currentCoordinatorId && currentCoordinatorId.id === coordinatorId) {
      throw new ConflictException('Вы передали почту текущего координатора');
    }

    await this.prismaService.$transaction(async (tx) => {
      if (currentCoordinatorId) {
        await tx.baseTeamParticipants.delete({
          where: {
            id: currentCoordinatorId.id,
          },
        });
      }

      await tx.baseTeamParticipants.create({
        data: {
          jobTitle: 'COORDINATOR',
          tripId,
          participantsUserId: coordinatorId,
        },
      });

      return;
    });

    return buildResponse('Координатор изменён');
  }
}
