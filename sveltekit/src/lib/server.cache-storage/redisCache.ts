import { createClient } from "redis";
import type { ICacheStorage } from "./ICacheStorage";
import { inject, singleton } from "tsyringe";
import { REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } from "$lib/envProvider";
import type { ILogger } from "$lib/_logging/ILogger";
import { ParseJSONResponse, dateReviver } from "../../routes/api/(utils)/dateReviver";


@singleton()
export class RedisCache implements ICacheStorage {

    private client = createClient({
        password: REDIS_PASSWORD,
        socket: {
            host: REDIS_HOST,
            port: REDIS_PORT
        }
    });

    private logger: ILogger

    private connected: boolean = false;

    constructor(@inject("Logger") logger: ILogger){

        this.logger = logger

        this.client.on('ready', async () => {
            this.logger.setup("Connected to redis");

            this.connected = true
        });
        
        this.client.connect()
        
        process.on('SIGINT', () => {
            this.client.quit()
        })
    }
    
    async get<T>(key: string): Promise<T | null> {
        
        if (!this.connected) return null;

        const value = await this.client.GET(key);
        
        if (!value) {
            this.logger.cacheMiss(key)
            return null
        }

        this.logger.cacheHit(key)
        return JSON.parse(value, dateReviver);
    }

    async set(key: string, value: any, exp_in_s: number): Promise<void> {

        if (!this.connected) return;

        await this.client.SET(key, JSON.stringify(value), {EX: exp_in_s})
        this.logger.cacheStore(key)
    }

    async invalidate(key: string): Promise<void> {

        if (!this.connected) return;

        this.logger.cacheInvalidate(key)
        await this.client.DEL(key)
    }
}