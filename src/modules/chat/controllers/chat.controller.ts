import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateMessageDto } from '../dto/create-message.dto';
import { ChatService } from '../services/chat.service';

@ApiTags('Chat')
@ApiBearerAuth('JWT')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send a chat message' })
  @ApiBody({
    schema: {
      example: {
        recipientId: '64df2a9f0db4ae12b7f0f123',
        content: 'Can we reschedule our session for tomorrow?',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Message sent' })
  sendMessage(
    @CurrentUser('sub') userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.sendMessage(userId, createMessageDto);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations returned' })
  getConversations(@CurrentUser('sub') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('messages/:conversationId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'Messages returned' })
  getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }
}
