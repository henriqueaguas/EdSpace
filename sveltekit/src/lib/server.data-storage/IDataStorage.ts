import type { IAuthStorage } from "./modules/AuthStorage";
import type { IFeedStorage } from "./modules/FeedStorage";
import type { IMeStorage } from "./modules/MeStorage";
import type { IPostStatsStorage } from "./modules/PostStatsStorage";
import type { IPostStorage } from "./modules/PostStorage";
import type { ITopicStatsStorage } from "./modules/TopicStatsStorage";
import type { ITopicStorage } from "./modules/TopicStorage";
import type { IUserStatsStorage } from "./modules/UserStatsStorage";
import type { IUserStorage } from "./modules/UserStorage";

export interface IDataStorage {
  auth: IAuthStorage;
  post: IPostStorage;
  me: IMeStorage;
  postStats: IPostStatsStorage;
  user: IUserStorage;
  userStats: IUserStatsStorage;
  topic: ITopicStorage;
  topicStats: ITopicStatsStorage;
  feed: IFeedStorage;

  _useTransaction<R>(
    block: (tx: IDataStorageInTransaction) => Promise<R>,
    isolationLevel?: "ReadCommitted" | "RepeatableRead" | "Serializable",
  ): Promise<R>;
};

// Same usage of a IDataStorage but the operations run in a transaction
export type IDataStorageInTransaction = Omit<IDataStorage, "_useTransaction">;
