import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PackageItem, PackageSchema } from '../packages/schema/package.schema';
import { TeacherProfile, TeacherProfileSchema } from '../teachers/schema/teacher-profile.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TeacherProfile.name,
        schema: TeacherProfileSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: PackageItem.name,
        schema: PackageSchema,
      },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
