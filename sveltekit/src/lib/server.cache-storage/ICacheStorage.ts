export interface ICacheStorage {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, exp_in_s: number): Promise<void>;
    invalidate(key: string): Promise<void>;
}
