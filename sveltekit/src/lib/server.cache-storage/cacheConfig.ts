import type { DataStorageCache } from "./types";

// ! Note: Operations which invalidate others can't have their values cached
export const CacheConfig: DataStorageCache<"root"> = {
  postStats: {
    // Cache post metadata
    byId: {
      opKey: [true],
      cache_time_s: 60 * 60,
      invalidators: {
        post: {
          delete: [true],
        },
      }
    },
  },

  topicStats: {
    byId: {
      opKey: [true],
      cache_time_s: 30 * 60,
    },
  },

  feed: {
    byId: {
      opKey: [true],
      cache_time_s: 30 * 60,
      invalidators: {
        feed: {
          delete: [true],
          update: [true]
        }
      }
    }
  },

  // Cache individual user metadata
  userStats: {
    publicById: {
      opKey: [true],
      cache_time_s: 60 * 60,
      invalidators: {
        me: {
          delete: [true],
          updateName: [true, false],
          updateProfilePicture: [true, false],
        }
      }
    },

    privateById: {
      opKey: [true],
      cache_time_s: 60 * 60,
      invalidators: {
        me: {
          delete: [true],
          updateName: [true, false],
          updateProfilePicture: [true, false],
        }
      }
    },

    // Cache global ranking and ranking per topic
    ranking: {
      opKey: [true, true],
      cache_time_s: 2 * 60,
    },
  },
}
/**
 * Quicker way to find what operations one operation invalidates
 * Format:
 * { 
 *  user: { 
 *    delete: {
 *      user: {
 *        get: [true] // mask used to calculate the cache key to invalidate 
 *      }
 *    } 
 *  } 
 * } 
 */
export const invalidators = calc()

function calc(): any {
  const result = {} as any
  for (const [mod, operations] of Object.entries(CacheConfig)) {
    for (const [operation, config] of Object.entries(operations)) {
      if (config.invalidators) {
        for (const [invModule, invOperations] of Object.entries(config.invalidators)) {
          for (const [invOperation, invConfig] of Object.entries(invOperations as any)) {
            if (!result[invModule]) result[invModule] = {} as any
            if (!result[invModule][invOperation]) result[invModule][invOperation] = {} as any
            if (!result[invModule][invOperation][mod]) result[invModule][invOperation][mod] = {} as any
            if (!result[invModule][invOperation][mod][operation]) result[invModule][invOperation][mod][operation] = {} as any
            result[invModule][invOperation][mod][operation] = invConfig
          }
        }
      }
    }
  }

  return result
}