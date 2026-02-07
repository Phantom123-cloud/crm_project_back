import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class PresentationsBuilder {
  constructor(private readonly prismaService: PrismaService) {}

  async allPresentations(dto: PaginationBasic, tripId: string) {
    const { page, limit } = dto;

    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [presentations, total] = await this.prismaService.$transaction([
      this.prismaService.presentations.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          date: 'asc',
        },
        where: {
          tripId,
        },
        select: {
          id: true,
          date: true,
          time: true,
          index: true,
          presentationTypes: {
            select: {
              name: true,
            },
          },
          place: {
            select: {
              name: true,
              city: true,
              street: true,
            },
          },
          creator: {
            select: {
              email: true,
              id: true,
            },
          },

          trip: {
            select: {
              name: true,
              dateFrom: true,
            },
          },

          presentationTeams: {
            select: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
              jobTitle: true,
            },
          },
        },
      }),
      this.prismaService.presentations.count({
        where: {
          tripId,
        },
      }),
    ]);

    const countPages = Math.ceil(total / limit);

    return buildResponse('Данные', {
      data: { presentations, total, countPages, page, limit },
    });
  }

  async presentationById(presentationId: string) {
    const presentation = await this.prismaService.presentations.findUnique({
      where: {
        id: presentationId,
      },
      select: {
        id: true,
        date: true,
        time: true,
        index: true,
        presentationTypes: {
          select: {
            name: true,
            id: true,
          },
        },
        place: {
          select: {
            name: true,
            city: true,
            street: true,
            id: true,
          },
        },
        creator: {
          select: {
            email: true,
            id: true,
          },
        },

        trip: {
          select: {
            isActive: true,
            id: true,
            name: true,
            dateFrom: true,
            dateTo: true,
            createdAt: true,
            baseTeamParticipants: true,
            warehouses: {
              select: {
                id: true,
              },
            },
            companies: {
              select: {
                id: true,
                name: true,
              },
            },
            creator: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },

        presentationTeams: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
            jobTitle: true,
          },
        },
      },
    });

    if (!presentation) {
      throw new NotFoundException('Презентация не найдена');
    }

    return buildResponse('Данные', {
      data: { presentation },
    });
  }
}
