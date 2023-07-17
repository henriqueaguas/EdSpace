export interface ILogger {
    error(message: string): Promise<void>
    info(message: string): Promise<void>
    setup(message: string): Promise<void>
    performance(message: string): Promise<void>
    cacheStore(key: string): Promise<void>
    cacheHit(key: string): Promise<void>
    cacheMiss(key: string): Promise<void>
    cacheInvalidate(key: string): Promise<void>
}