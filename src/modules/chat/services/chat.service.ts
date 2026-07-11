/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UsersService } from '../../users/services/users.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import {
  Conversation,
  ConversationDocument,
} from '../schema/conversation.schema';
import { Message, MessageDocument } from '../schema/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getOrCreateConversation(userId: string, recipientId: string) {
    const recipient = await this.usersService.findById(recipientId);

    if (!recipient) {
      throw new NotFoundException('Recipient not found.');
    }

    let conversation = await this.conversationModel.findOne({
      $or: [
        { participantOneId: userId, participantTwoId: recipientId },
        { participantOneId: recipientId, participantTwoId: userId },
      ],
    });

    if (!conversation) {
      conversation = await this.conversationModel.create({
        participantOneId: userId,
        participantTwoId: recipientId,
      });
    }

    return conversation;
  }

  async sendMessage(userId: string, dto: CreateMessageDto) {
    const conversation = await this.getOrCreateConversation(
      userId,
      dto.recipientId,
    );

    const message = await this.messageModel.create({
      conversationId: conversation._id,
      senderId: userId,
      content: dto.content,
    });

    conversation.lastMessage = dto.content;
    await conversation.save();

    return message;
  }

  async getMessages(conversationId: string) {
    return this.messageModel
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getConversations(userId: string) {
    return this.conversationModel
      .find({
        $or: [{ participantOneId: userId }, { participantTwoId: userId }],
      })
      .sort({ updatedAt: -1 })
      .exec();
  }
}
