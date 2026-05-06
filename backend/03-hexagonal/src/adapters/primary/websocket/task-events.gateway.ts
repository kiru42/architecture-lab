import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TaskEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake or first message
      const token =
        client.handshake.auth?.token || client.handshake.headers?.authorization;

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      const userId = payload.sub;

      // Store connection
      this.connectedUsers.set(client.id, userId);

      console.log(`User ${userId} connected via WebSocket`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      console.log(`User ${userId} disconnected from WebSocket`);
      this.connectedUsers.delete(client.id);
    }
  }

  // Emit task.assigned event
  emitTaskAssigned(data: {
    taskId: string;
    assigneeId: string;
    assigneeName: string;
  }) {
    this.server.emit('task.assigned', data);
  }
}
