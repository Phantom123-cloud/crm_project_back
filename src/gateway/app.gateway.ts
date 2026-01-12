import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly prismaService: PrismaService) {}

  @WebSocketServer() server: Server;

  // private userSockets = new Map<string, Set<string>>();
  // private disconnectTimers = new Map<string, NodeJS.Timeout>();

  // handleConnection(socket: Socket) {
  //   // открытие сокета на пинг для онлайна
  //   this.onlineObserver(socket);

  //   socket.on('register', async (userId: string) => {
  //     // получаем таймаут юзера
  //     const timeout = this.disconnectTimers.get(userId);

  //     // если он есть (это значит что мы не первый раз конектимся, а сделали обновление страницы и ф-ция handleDisconnect
  //     // запустила setTimeout который через 5 сек сменит нам статус на  isOnline: false)
  //     if (timeout) {
  //       // удаляем сначала сам таймер
  //       clearTimeout(timeout);
  //       // а затем удаляем юзера из списка тех кто ожидает isOnline: false
  //       this.disconnectTimers.delete(userId);
  //     }

  //     // если юзера нет в списке тех кто в сокете (значит первый коннект)
  //     if (!this.userSockets.has(userId)) {
  //       // добавляем юзер id и пустой Set в Map сокета
  //       this.userSockets.set(userId, new Set());

  //       // меняем в бд на isOnline: true, lastConnections
  //       const lastConnections = new Date().toISOString();
  //       await this.prismaService.user.update({
  //         where: { id: userId },
  //         data: { isOnline: true, lastConnections },
  //       });
  //     }

  //     // в список юзеров из сокета текущему добавляем в Set id от его подключения
  //     this.userSockets.get(userId)!.add(socket.id);
  //   });
  // }

  // async handleDisconnect(socket: Socket) {
  //   // при отключении юзера, перебираем данные из Map (там лежит пара - userId и массив (множество) из Set id сокетов принадлежащих юзеру)
  //   //1.1 по логике данного ЦРМ в Set всегд будет только 1 socket id так как юзеру запрещено в коде зайти с одного логина на несколько устройств или браузеров
  //   // его просто не пустит, но оставим так что бы было удобнее

  //   for (const [userId, sockets] of this.userSockets.entries()) {
  //     // если есть в сокетах такой id
  //     if (sockets.has(socket.id)) {
  //       // удаляем его из сокета так как мы переподключаемся и мы его должны убить
  //       sockets.delete(socket.id);

  //       // если сокет пустой, открываем setTimeout (по нашей бизнес логике это условие будет срабатывать всегда при
  //       // реконекте, ранее описывал причину в сноске 1.1)
  //       if (sockets.size === 0) {
  //         const timeout = setTimeout(async () => {
  //           // если повторного подключения не было в течении 5 сек, убиваем юзера и оффлайним
  //           if (!this.userSockets.get(userId)?.size) {
  //             this.userSockets.delete(userId);
  //             this.disconnectTimers.delete(userId);

  //             await this.prismaService.user.update({
  //               where: { id: userId },
  //               data: { isOnline: false },
  //             });
  //           }
  //         }, 5000);
  //         this.disconnectTimers.set(userId, timeout);
  //       }
  //     }
  //   }
  // }

  // // для отлеживания онлайна
  // onlineObserver(socket: Socket) {
  //   socket.on('ping', async (userId: string) => {
  //     const lastConnections = new Date().toISOString();
  //     await this.prismaService.user.update({
  //       where: { id: userId },
  //       data: { isOnline: true, lastConnections },
  //     });
  //   });
  // }

  onlineObserver(socket: Socket) {
    socket.on('ping', async (userId: string) => {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { isOnline: true, lastConnections: new Date().toISOString() },
      });
    });
  }

  handleConnection(socket: Socket) {
    this.onlineObserver(socket);
  }

  handleDisconnect() {
    // можно оставить пустым или логировать
  }
}
