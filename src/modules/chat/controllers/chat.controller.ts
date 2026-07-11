import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from '../dto/create-message.dto';
import { ChatService } from '../services/chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  sendMessage(
    @CurrentUser('sub') userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.sendMessage(userId, createMessageDto);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  getConversations(@CurrentUser('sub') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('messages/:conversationId')
  @UseGuards(JwtAuthGuard)
  getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }
}
