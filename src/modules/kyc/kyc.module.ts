import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { KycController } from './controllers/kyc.controller';
import { Kyc, KycSchema } from './schema/kyc.schema';
import { KycService } from './services/kyc.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Kyc.name, schema: KycSchema }]),
  ],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
