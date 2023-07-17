import "reflect-metadata"
import { PrismaClient as PrismaClientEdge } from "@prisma/client/edge";
import { PrismaClient } from "@prisma/client";
import type { IBlobStorage } from "./server.blob-storage/IBlobStorage";
import { GCloudBlobStorage } from "./server.blob-storage/gcloud/GCloudBlobStorage";
import { PrismaDataStorage } from "./server.data-storage/_index";
import { PerformanceLoggerHook } from "./_logging/PerformanceLoggerHook";
import { NODE_ENV } from "./envProvider";
import { DiskBlobStorage } from "./server.blob-storage/disk/DiskBlobStorage";
import { StorageBucketsConfig, type IStorageBucketsConfig } from "./server.blob-storage/BucketsConfig";
import type { ICacheStorage } from "./server.cache-storage/ICacheStorage";
import { Lifecycle, container } from "tsyringe";
import type { IDataStorage } from "./server.data-storage/IDataStorage";
import { Services, type IServices, } from "./services/_index.server";
import { HttpErrorTransformerHook } from "./_errors/HttpErrorConvert";
import type { ILogger } from "./_logging/ILogger";
import { ConsoleLogger } from "./_logging/ConsoleLogger";
import { RedisCache } from "./server.cache-storage/redisCache";

export const currentEnv = NODE_ENV as "development" | "test" | "production";

// ! Not being used in other files due to unknown error while testing
export const DependencyIds = {
  Logger: "Logger",
  PrismaClient: "PrismaClient",
  DataStorage: "DataStorage",
  StorageBucketsConfig: "StorageBucketsConfig",
  BlobStorage: "BlobStorage",
  Services: "Services",
  CacheStorage: "CacheStorage",
}
// Register dependencies into container 
export class EmptyDependency { }
container.register<ICacheStorage | EmptyDependency>(DependencyIds.CacheStorage, { useClass: currentEnv === 'production' ? RedisCache : EmptyDependency/* MemCache */ });
container.register<ILogger>(DependencyIds.Logger, { useClass: currentEnv === "production" ? ConsoleLogger : ConsoleLogger }, { lifecycle: Lifecycle.Singleton })
container.register<PrismaClient>(DependencyIds.PrismaClient, { useValue: currentEnv === "production" ? new PrismaClientEdge() : new PrismaClient() })
container.register<IDataStorage>(DependencyIds.DataStorage, { useClass: PrismaDataStorage }, { lifecycle: Lifecycle.Singleton })
container.register<IStorageBucketsConfig>(DependencyIds.StorageBucketsConfig, { useValue: StorageBucketsConfig });
container.register<IBlobStorage>(DependencyIds.BlobStorage, { useClass: currentEnv === "production" ? GCloudBlobStorage : DiskBlobStorage }, { lifecycle: Lifecycle.Singleton });
container.register<IServices>(DependencyIds.Services, { useClass: Services }, { lifecycle: Lifecycle.Singleton })


// Grab and make the built dependencies available to the entire application
export const logger = container.resolve(DependencyIds.Logger) as ILogger
export const blobStorage = container.resolve(DependencyIds.BlobStorage) as IBlobStorage
export const dataStorage = container.resolve(DependencyIds.DataStorage) as IDataStorage
export const prismaClient = container.resolve(DependencyIds.PrismaClient) as PrismaClient;
export const services = container.resolve(DependencyIds.Services) as IServices

if (currentEnv !== "test") {
  HttpErrorTransformerHook(services)
  PerformanceLoggerHook(services)
}