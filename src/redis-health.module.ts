import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis-health.indicator';
import {
  RedisHealthModuleAsyncOptions,
  RedisHealthModuleOptions,
  RedisHealthModuleOptionsFactory,
} from './redis-health.interfaces';
import { REDIS_HEALTH_MODULE_OPTIONS } from './redis-health.constants';

@Module({})
export class RedisHealthModule {
  static forRoot(options: RedisHealthModuleOptions): DynamicModule {
    return {
      module: RedisHealthModule,
      imports: [TerminusModule],
      providers: [
        {
          provide: REDIS_HEALTH_MODULE_OPTIONS,
          useValue: options,
        },
        RedisHealthIndicator,
      ],
      exports: [RedisHealthIndicator],
    };
  }

  static forRootAsync(
    options: RedisHealthModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: RedisHealthModule,
      imports: [...(options.imports || []), TerminusModule],
      providers: [
        ...this.createAsyncProviders(options),
        RedisHealthIndicator,
      ],
      exports: [RedisHealthIndicator],
    };
  }

  private static createAsyncProviders(
    options: RedisHealthModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: RedisHealthModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: REDIS_HEALTH_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: REDIS_HEALTH_MODULE_OPTIONS,
      useFactory: async (optionsFactory: RedisHealthModuleOptionsFactory) =>
        await optionsFactory.createRedisHealthOptions(),
      inject: [options.useExisting || options.useClass!],
    };
  }
}
