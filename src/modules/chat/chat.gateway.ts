import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('send_message')
  // eslint-disable-next-line prettier/prettier
  handleMessage(@MessageBody() payload: { conversationId: string; senderId: string; content: string }) {
    this.server.emit('receive_message', payload);
  }
}
