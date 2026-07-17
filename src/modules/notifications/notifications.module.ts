import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '../users/users.module';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
