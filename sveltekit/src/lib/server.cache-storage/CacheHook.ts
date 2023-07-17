import { logger } from "$lib/index.server";
import type { IDataStorage } from "$lib/server.data-storage/IDataStorage";
import type { PrismaDataStorage } from "$lib/server.data-storage/_index";
import type { ICacheStorage } from "./ICacheStorage";
import { CacheConfig, invalidators } from "./cacheConfig";
import type { ExcludeUnderscore } from "./types";

export function CacheHook(cacheStorage: ICacheStorage, dataStorage: IDataStorage | any) {
  Object.getOwnPropertyNames(dataStorage).forEach((mn) => {
    if (
      typeof dataStorage[mn] === "object" &&
      dataStorage[mn] !== null &&
      mn[0] !== "_" // ignore properties starting with '_'
    ) {
      // ex: PrismaDataStorage.post
      const moduleName = mn as ExcludeUnderscore<
        keyof PrismaDataStorage
      >;
      const module = dataStorage[moduleName];
      // ex: PrismaDataStorage.post.create()
      const moduleOperations = Object.getOwnPropertyNames(
        Object.getPrototypeOf(module),
      );

      moduleOperations
        .filter((name) => name !== "constructor")
        .filter((name) => name[0] !== "_")
        .filter((name) => typeof module[name] === "function")
        .forEach((operationName) => {
          const cacheConfig: {
            opKey: boolean[];
            cache_time_s: number;
            // @ts-ignore
          } = CacheConfig[moduleName]?.[operationName];
          // Type Example: { postStats: { byId: [true], trending: [true] } }
          const invalidates = invalidators[moduleName]?.[operationName]

          if (cacheConfig) {
            const originalFunction = module[operationName];

            module[operationName] = async function (...args: any[]) {

              const cacheKey =
                moduleName + "." +
                operationName + "." +
                calculateArgs(cacheConfig.opKey, args);

              const cachedValue = await cacheStorage.get(cacheKey);

              if (cachedValue !== null) {
                return cachedValue;
              } else {
                const result = await originalFunction.apply(this, args);
                await cacheStorage.set(
                  cacheKey,
                  result,
                  cacheConfig.cache_time_s,
                );

                return result;
              }
            };
          } else if (invalidates) {
            const originalFunction = module[operationName];

            module[operationName] = async function (...args: any[]) {

              const result = await originalFunction.apply(this, args)

              const invalidations: Promise<any>[] = []
              // If everything goes fine, invalidate other caches who need invalidation
              for (const [invModule, invOperations] of Object.entries(invalidates)) {
                for (const [invOperation, invalidatorArgs] of Object.entries(invOperations as any)) {
                  const cacheKey =
                    invModule + "." +
                    invOperation + "." +
                    calculateArgs(invalidatorArgs as boolean[], args)

                  invalidations.push(cacheStorage.invalidate(cacheKey))
                }
              }

              Promise.all(invalidations)

              return result
            }
          }
        });
    }
  });

  logger.setup("Cache hooked to Data Storage layer");
}

// Calculates the fragment of the cache key that depends on function arguments
function calculateArgs(opKey: boolean[], args: any[]) {
  return opKey
    .map((value, index) => (value ? JSON.stringify(args[index]) : ""))
    .join("")
}