import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const username = this.configService.get<string>('REDIS_USERNAME');
    const useTls = this.configService.get<string>('REDIS_TLS') === 'true';

    const redisOptions: any = {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: null,
      connectTimeout: 10000, // 10 seconds
    };

    if (redisUrl) {
      this.logger.log('Connecting to Redis using REDIS_URL');
      this.client = new Redis(redisUrl, redisOptions);
    } else {
      this.logger.log(`Connecting to Redis at ${host}:${port}`);
      this.client = new Redis({
        ...redisOptions,
        host,
        port,
        password,
        username,
        tls: useTls ? {} : undefined,
      });
    }

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });

    this.client.on('error', (error: Error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
      if (error.stack) {
        this.logger.debug(error.stack);
      }
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis is reconnecting...');
    });
  }

  async onModuleInit() {
    // Initial check
    try {
      this.logger.log('Pinging Redis...');
      const result = await this.client.ping();
      this.logger.log(`Redis ping result: ${result}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not ping Redis on startup: ${errorMessage}`);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      return this.client.set(key, stringValue, 'EX', ttlSeconds);
    }
    return this.client.set(key, stringValue);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async del(key: string) {
    return this.client.del(key);
  }
}
