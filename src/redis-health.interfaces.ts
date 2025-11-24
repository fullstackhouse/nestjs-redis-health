import { ModuleMetadata, Type } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

export interface RedisHealthModuleOptions extends RedisOptions {
  name?: string;
}

export interface RedisHealthModuleOptionsFactory {
  createRedisHealthOptions():
    | Promise<RedisHealthModuleOptions>
    | RedisHealthModuleOptions;
}

export interface RedisHealthModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<RedisHealthModuleOptionsFactory>;
  useClass?: Type<RedisHealthModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<RedisHealthModuleOptions> | RedisHealthModuleOptions;
  inject?: any[];
}
