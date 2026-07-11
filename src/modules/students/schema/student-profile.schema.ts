import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentProfileDocument = HydratedDocument<StudentProfile>;

@Schema({ timestamps: true })
export class StudentProfile {
  @Prop({ required: true, unique: true, index: true })
  userId!: string;

  @Prop({ type: [String], default: [] })
  preferredSubjects!: string[];

  @Prop({ type: [String], default: [] })
  learningGoals!: string[];

  @Prop({ type: [String], default: [] })
  interests!: string[];

  @Prop({ type: String, default: null })
  bio!: string | null;
}

export const StudentProfileSchema =
  SchemaFactory.createForClass(StudentProfile);
