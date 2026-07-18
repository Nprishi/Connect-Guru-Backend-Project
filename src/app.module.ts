import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { mongooseConfig } from './config/mongoose.config';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ChatModule } from './modules/chat/chat.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { KycModule } from './modules/kyc/kyc.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PackagesModule } from './modules/packages/packages.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RedisModule } from './modules/redis/redis.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SearchModule } from './modules/search/search.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { StudentsModule } from './modules/students/students.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
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

    NotificationsModule,

    ReviewsModule,

    SessionsModule,

    SearchModule,

    AnalyticsModule,

    CategoriesModule,

    SubjectsModule,

    ChatModule,

    RedisModule,

    CloudinaryModule,

    KycModule,

    AdminModule,

    SuperAdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
