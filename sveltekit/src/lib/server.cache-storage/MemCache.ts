import { inject, singleton } from "tsyringe";
import type { ICacheStorage } from "./ICacheStorage";
import type { ILogger } from "$lib/_logging/ILogger";

@singleton()
export class MemCache implements ICacheStorage {
  private _cache: Map<string, { value: any; exp_date: number }> = new Map();
  private logger: ILogger

  // * For debug/insight: visualize the cache data every 2.5 seconds
  // constructor() {
  //   setInterval(() => {
  //     let c = 0
  //     for (const [k, _] of this._cache.entries()) {
  //       c++
  //       console.log(k)
  //     }
  //     console.log("Cache size", c)
  //   }, 2500)
  // }

  constructor(@inject("Logger") logger: ILogger) {
    this.logger = logger
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this._cache.get(key);
    if (!entry || Date.now() > entry?.exp_date) {
      this.logger.cacheMiss(key)
      return null
    };
    this.logger.cacheHit(key)
    return entry.value;
  }

  async set(key: string, value: any, exp_in_s: number): Promise<void> {
    this._cache.set(key, {
      value,
      exp_date: Date.now() + exp_in_s * 1000,
    });
    this.logger.cacheStore(key)
  }

  async invalidate(key: string): Promise<void> {
    this.logger.cacheInvalidate(key)
    this._cache.delete(key);
  }
}
