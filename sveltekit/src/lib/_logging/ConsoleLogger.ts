import { singleton } from "tsyringe";
import type { ILogger } from "./ILogger";

@singleton()
export class ConsoleLogger implements ILogger {
    async cacheStore(key: string): Promise<void> {
        console.info(`[cache store] ${key}`);
    }

    async cacheHit(key: string): Promise<void> {
        console.info(`[cache hit] ${key}`)
    }

    async cacheMiss(key: string): Promise<void> {
        console.info(`[cache miss] ${key}`)
    }

    async cacheInvalidate(key: string): Promise<void> {
        console.info(`[cache invalidate] ${key}`)
    }

    async setup(message: string): Promise<void> {
        console.info(`[setup] ${message}`)
    }

    async info(message: string): Promise<void> {
        console.info(`[info] ${message}`)
    }

    async performance(message: string): Promise<void> {
        console.log(`[performance] ${message}`)
    }

    async error(message: string): Promise<void> {
        console.error(`[error] ${message}`)
    }
}