# @fullstackhouse/nestjs-redis-health

Redis health indicator for NestJS Terminus using the modern v11 API.

## Installation

```bash
npm install @fullstackhouse/nestjs-redis-health
```

**Peer dependencies:**
- `@nestjs/common`: ^10.0.0 || ^11.0.0
- `@nestjs/terminus`: ^11.0.0
- `ioredis`: ^5.0.0

## Usage

### Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthModule } from '@fullstackhouse/nestjs-redis-health';

@Module({
  imports: [
    TerminusModule,
    RedisHealthModule.forRoot({
      host: 'localhost',
      port: 6379,
      db: 0,
    }),
  ],
})
export class HealthModule {}
```

### Health Check Controller

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@fullstackhouse/nestjs-redis-health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
```

### Async Configuration

```typescript
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RedisHealthModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        db: configService.get('REDIS_DB'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class HealthModule {}
```

### Multiple Redis Instances

```typescript
@Module({
  imports: [
    RedisHealthModule.forRoot({
      name: 'cache',
      host: 'localhost',
      db: 0,
    }),
    RedisHealthModule.forRoot({
      name: 'queue',
      host: 'localhost',
      db: 1,
    }),
  ],
})
export class HealthModule {}

// In your health check
check() {
  return this.health.check([
    () => this.redis.isHealthy('redis-cache', 'cache'),
    () => this.redis.isHealthy('redis-queue', 'queue'),
  ]);
}
```

## API

### `RedisHealthIndicator`

#### `isHealthy(key: string, connectionName?: string)`

Checks if Redis connection is healthy by performing a PING command.

**Parameters:**
- `key`: Identifier for the health check result
- `connectionName`: (Optional) Name of the connection to check. Defaults to 'default'

**Returns:** Health check result following Terminus v11 API

### `RedisHealthModule`

#### `forRoot(options: RedisHealthModuleOptions)`

Configure module with static options.

**Options:** All `ioredis` RedisOptions plus:
- `name`: (Optional) Connection name for multiple instances

#### `forRootAsync(options: RedisHealthModuleAsyncOptions)`

Configure module with async options using factory, existing provider, or class.

## Features

- ✅ Modern Terminus v11 API with `HealthIndicatorService`
- ✅ Lazy connection - only connects when health check runs
- ✅ Automatic cleanup on module destroy
- ✅ Support for multiple Redis instances
- ✅ Full TypeScript support
- ✅ Minimal dependencies

## License

MIT
