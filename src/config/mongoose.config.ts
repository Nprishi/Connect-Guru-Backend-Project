import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleAsyncOptions,
  MongooseModuleOptions,
} from '@nestjs/mongoose';

const logger = new Logger('MongoDB');

export const mongooseConfig: MongooseModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): MongooseModuleOptions => {
    const uri =
      configService.get<string>('database.uri') ??
      'mongodb://127.0.0.1:27017/connect-guru';

    return {
      uri,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryAttempts: 1,
      retryDelay: 1000,
      autoIndex: false,
      bufferCommands: false,
      maxPoolSize: 10,

      onConnectionCreate(connection) {
        logger.log('\n Step 2: MongoDB connected successfully');

        connection.on('error', (error) => {
          logger.error('MongoDB connection error', error);
        });

        connection.on('disconnected', () => {
          logger.warn('MongoDB disconnected');
        });

        return connection;
      },
    };
  },
};
