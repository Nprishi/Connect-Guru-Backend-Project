import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client?: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: `redis://:${process.env.REDIS_PASSWORD || ''}@${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });

    await this.client.connect();
    this.logger.log('\n Step 3: Redis connected successfully');
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (!this.client) {
      return;
    }

    if (ttlSeconds) {
      await this.client.set(key, value, { EX: ttlSeconds });
      return;
    }

    await this.client.set(key, value);
  }

  async get(key: string) {
    if (!this.client) {
      return null;
    }

    return this.client.get(key);
  }

  async del(key: string) {
    if (!this.client) {
      return;
    }

    await this.client.del(key);
  }
}
