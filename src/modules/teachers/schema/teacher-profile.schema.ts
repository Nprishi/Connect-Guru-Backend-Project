import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TeacherProfileDocument = HydratedDocument<TeacherProfile>;

@Schema({ timestamps: true })
export class TeacherProfile {
  @Prop({ required: true, unique: true, index: true })
  userId!: string;

  @Prop({ type: [String], default: [] })
  subjects!: string[];

  @Prop({ type: [String], default: [] })
  education!: string[];

  @Prop({ type: [String], default: [] })
  experience!: string[];

  @Prop({ type: [String], default: [] })
  availability!: string[];

  @Prop({ type: Number, default: 0 })
  hourlyRate!: number;

  @Prop({ type: String, default: null })
  bio!: string | null;
}

export const TeacherProfileSchema =
  SchemaFactory.createForClass(TeacherProfile);
