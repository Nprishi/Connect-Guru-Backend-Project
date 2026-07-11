import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, index: true })
  conversationId!: string;

  @Prop({ required: true, index: true })
  senderId!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Boolean, default: false })
  isRead!: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
