import { inject, singleton } from "tsyringe";
import type { IDataStorage } from "$lib/server.data-storage/IDataStorage";
import type { IBlobStorage } from "../server.blob-storage/IBlobStorage";
import {
  FeedServices,
  type IFeedServices,
} from "./server.modules/FeedServices";
import { type IMeServices, MeServices } from "./server.modules/MeServices";
import {
  type IPostServices,
  PostServices,
} from "./server.modules/PostServices";
import {
  type ITopicServices,
  TopicServices,
} from "./server.modules/TopicServices";
import {
  type IUserServices,
  UserServices,
} from "./server.modules/UserServices";

export interface IServices {
  user: IUserServices;
  post: IPostServices;
  topic: ITopicServices;
  me: IMeServices;
  feed: IFeedServices;
}

@singleton()
export class Services implements IServices {
  user: IUserServices;
  post: IPostServices;
  topic: ITopicServices;
  me: IMeServices;
  feed: IFeedServices;

  constructor(
    @inject("DataStorage")
    dataStorage: IDataStorage,
    @inject("BlobStorage")
    blobStorage: IBlobStorage
  ) {
    this.user = new UserServices(dataStorage, blobStorage);
    this.post = new PostServices(dataStorage, blobStorage);
    this.topic = new TopicServices(dataStorage);
    this.me = new MeServices(dataStorage, blobStorage);
    this.feed = new FeedServices(dataStorage);
  }
}
