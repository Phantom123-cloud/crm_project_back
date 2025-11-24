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

  private userSockets = new Map<string, Set<string>>();
  private disconnectTimers = new Map<string, NodeJS.Timeout>();

  handleConnection(socket: Socket) {
    this.onlineObserver(socket);
    socket.on('register', async (userId: string) => {
      console.log(userId);

      const timeout = this.disconnectTimers.get(userId);

      if (timeout) {
        clearTimeout(timeout);
        this.disconnectTimers.delete(userId);
      }

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
        console.log('RECONNECT', userId);

        const lastConnections = new Date().toISOString();
        await this.prismaService.user.update({
          where: { id: userId },
          data: { isOnline: true, lastConnections },
        });
      }
      this.userSockets.get(userId)!.add(socket.id);
    });
  }

  handleDisconnect(socket: Socket) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          const timeout = setTimeout(async () => {
            if (!this.userSockets.get(userId)?.size) {
              this.userSockets.delete(userId);
              this.disconnectTimers.delete(userId);

              await this.prismaService.user.update({
                where: { id: userId },
                data: { isOnline: false },
              });
            }
          }, 5000);
          this.disconnectTimers.set(userId, timeout);
        }
      }
    }
  }

  onlineObserver(socket: Socket) {
    socket.on('ping', async (userId: string) => {
      console.log('ONLINE', userId);

      const lastConnections = new Date().toISOString();
      await this.prismaService.user.update({
        where: { id: userId },
        data: { isOnline: true, lastConnections },
      });
    });
  }
}
