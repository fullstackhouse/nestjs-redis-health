import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import Redis from 'ioredis';
import { RedisHealthModuleOptions } from './redis-health.interfaces';
import { REDIS_HEALTH_MODULE_OPTIONS } from './redis-health.constants';

@Injectable()
export class RedisHealthIndicator implements OnModuleInit, OnModuleDestroy {
  private connections = new Map<string, Redis>();

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(REDIS_HEALTH_MODULE_OPTIONS)
    private readonly options: RedisHealthModuleOptions,
  ) {}

  onModuleInit() {
    const name = this.options.name || 'default';
    const redis = new Redis({
      ...this.options,
      lazyConnect: true,
    });
    this.connections.set(name, redis);
  }

  async onModuleDestroy() {
    await Promise.all(
      Array.from(this.connections.values()).map((redis) => redis.quit()),
    );
  }

  async isHealthy(key: string, connectionName = 'default') {
    const indicator = this.healthIndicatorService.check(key);
    const redis = this.connections.get(connectionName);

    if (!redis) {
      return indicator.down({
        message: `Redis connection '${connectionName}' not found`,
      });
    }

    try {
      if (redis.status !== 'ready') {
        await redis.connect();
      }
      await redis.ping();
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: (error as Error).message,
      });
    }
  }
}
