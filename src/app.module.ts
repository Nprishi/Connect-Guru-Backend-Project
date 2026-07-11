import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { mongooseConfig } from './config/mongoose.config';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ChatModule } from './modules/chat/chat.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { KycModule } from './modules/kyc/kyc.module';
import { PackagesModule } from './modules/packages/packages.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RedisModule } from './modules/redis/redis.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration, databaseConfig],
      validationSchema: envValidationSchema,
    }),

    MongooseModule.forRootAsync(mongooseConfig),

    AuthModule,

    UsersModule,

    TeachersModule,

    StudentsModule,

    BookingsModule,

    PackagesModule,

    PaymentsModule,

    ChatModule,

    RedisModule,

    CloudinaryModule,

    KycModule,

    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
