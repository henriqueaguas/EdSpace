import type { PrismaClient } from "@prisma/client";
import type { TransactionalPrismaClient } from "./_TransactionalStorage";
import { PrismaAuthStorage } from "./modules/AuthStorage";
import { PrismaMeStorage } from "./modules/MeStorage";
import { PrismaPostStatsStorage } from "./modules/PostStatsStorage";
import { PrismaPostStorage } from "./modules/PostStorage";
import { PrismaTopicStatsStorage } from "./modules/TopicStatsStorage";
import { PrismaTopicStorage } from "./modules/TopicStorage";
import { PrismaUserStatsStorage } from "./modules/UserStatsStorage";
import { PrismaUserStorage } from "./modules/UserStorage";
import type { IDataStorage, IDataStorageInTransaction } from "./IDataStorage";
import { type IFeedStorage, PrismaFeedStorage } from "./modules/FeedStorage";
import { CacheHook } from "$lib/server.cache-storage/CacheHook";
import type { ICacheStorage } from "$lib/server.cache-storage/ICacheStorage";
import { inject, singleton } from "tsyringe";
import { EmptyDependency } from "$lib/index.server";

@singleton()
export class PrismaDataStorage implements IDataStorage {
  private _prismaClient: PrismaClient | TransactionalPrismaClient;
  private _cacheStorage: ICacheStorage | EmptyDependency;

  auth: PrismaAuthStorage;
  post: PrismaPostStorage;
  me: PrismaMeStorage;
  postStats: PrismaPostStatsStorage;
  user: PrismaUserStorage;
  userStats: PrismaUserStatsStorage;
  topic: PrismaTopicStorage;
  topicStats: PrismaTopicStatsStorage;
  feed: IFeedStorage;

  constructor(
    @inject("PrismaClient")
    client: PrismaClient | TransactionalPrismaClient,
    @inject("CacheStorage")
    cacheStorage: ICacheStorage | EmptyDependency,
  ) {
    this._prismaClient = client;

    this.me = new PrismaMeStorage(this, client);
    this.post = new PrismaPostStorage(this, client);
    this.postStats = new PrismaPostStatsStorage(this, client);
    this.user = new PrismaUserStorage(this, client);
    this.userStats = new PrismaUserStatsStorage(this, client);
    this.topic = new PrismaTopicStorage(this, client);
    this.topicStats = new PrismaTopicStatsStorage(this, client);
    this.auth = new PrismaAuthStorage(this, client);
    this.feed = new PrismaFeedStorage(this, client);

    this._cacheStorage = cacheStorage;
    if (!(cacheStorage instanceof EmptyDependency)) {
      CacheHook(cacheStorage, this);
    }
  }

  _useTransaction<R>(
    block: (transaction: IDataStorageInTransaction) => Promise<R>,
    isolationLevel: "ReadCommitted" | "RepeatableRead" | "Serializable" =
      "RepeatableRead",
  ): Promise<R> {
    if ("$transaction" in this._prismaClient) {
      return this._prismaClient.$transaction(
        (transactionalClient) => {
          const ds = new PrismaDataStorage(transactionalClient, this._cacheStorage);
          return block(ds);
        },
        { isolationLevel },
      );
    } else {
      // Already in a transaction. Just re-use it.
      return block(this);
    }
  }
}
