import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import {
  StudentProfile,
  StudentProfileSchema,
} from './schema/student-profile.schema';
import { StudentsController } from './controllers/students.controller';
import { StudentsService } from './services/students.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: StudentProfile.name,
        schema: StudentProfileSchema,
      },
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
