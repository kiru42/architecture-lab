import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({ cors: true })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.authService.getUserById(payload.sub);

      if (!user) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      this.userSockets.set(user.id, client.id);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);
    }
  }

  notifyTaskAssigned(assigneeId: string, data: { taskId: string; assigneeName: string }) {
    const socketId = this.userSockets.get(assigneeId);
    if (socketId) {
      this.server.to(socketId).emit('task.assigned', {
        taskId: data.taskId,
        assigneeId,
        assigneeName: data.assigneeName,
      });
    }
  }
}
