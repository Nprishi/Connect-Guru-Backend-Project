import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubjectsController } from './controllers/subjects.controller';
import { SubjectItem, SubjectSchema } from './schema/subject.schema';
import { SubjectsService } from './services/subjects.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SubjectItem.name,
        schema: SubjectSchema,
      },
    ]),
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
