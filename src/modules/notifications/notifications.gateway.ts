import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join-user-room')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    client.join(payload.userId);
    return { success: true, message: 'Joined user notification room.' };
  }

  emitToUser(userId: string, payload: Record<string, unknown>) {
    this.server.to(userId).emit('notification', payload);
  }
}
