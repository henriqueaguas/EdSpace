import type { PrismaDataStorage } from "$lib/server.data-storage/_index";

export type OperationCacheConfig<T extends any[] | any> = {
  opKey: T;
  cache_time_s: number;
  invalidators?: DataStorageCache<"nested">;
};

export type DataStorageCache<T extends "nested" | "root"> = {
  [K1 in ExcludeUnderscore<keyof PrismaDataStorage>]?: {
    [K2 in ExcludeUnderscore<keyof PrismaDataStorage[K1]>]?: T extends "root"
    ? OperationCacheConfig<
      ConvertToBoolean<
        Parameters<
          PrismaDataStorage[K1][K2] extends (...args: any[]) => any
          ? PrismaDataStorage[K1][K2]
          : never
        >
      >
    >
    : ConvertToBoolean<
      Parameters<
        PrismaDataStorage[K1][K2] extends (...args: any[]) => any
        ? PrismaDataStorage[K1][K2]
        : never
      >
    >;
  };
};

type ConvertToBoolean<T> = {
  [K in keyof T]: boolean;
};

export type ExcludeUnderscore<T extends string | number | symbol> = T extends
  `_${infer R}` ? never
  : T;
