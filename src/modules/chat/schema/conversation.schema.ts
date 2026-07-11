import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, index: true })
  participantOneId!: string;

  @Prop({ required: true, index: true })
  participantTwoId!: string;

  @Prop({ type: String, default: null })
  lastMessage!: string | null;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
