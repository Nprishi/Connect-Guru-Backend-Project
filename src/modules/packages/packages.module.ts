import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { PackageItem, PackageSchema } from './schema/package.schema';
import { PackagesController } from './controllers/packages.controller';
import { PackagesService } from './services/packages.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: PackageItem.name,
        schema: PackageSchema,
      },
    ]),
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
