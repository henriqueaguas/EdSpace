import {
  FeedNotFound,
  FeedTopicsAndAuthors,
  NotYourFeed,
  OnlyOwnerCanPerform,
  RepeatedAuthors,
  RepeatedTopics,
  TopicsNotFound,
  UserNotFound,
  UsersNotFound,
} from "$lib/_errors/LogicError";
import type { IDataStorage } from "$lib/server.data-storage/IDataStorage";
import {
  feedAuthors,
  feedNameSchema,
  feedTopics,
  topicNameSchema,
  uuid,
} from "../InputValidators/commonValidators";
import { LogicConstraints } from "../constraints";
import { hasRepetitions } from "../utils/findRepetitions";

export interface IFeedServices {
  byId(
    feedId: string,
    myUserId: string,
  ): Promise<tfeed.Feed>;

  create(
    ownerId: string,
    name: string,
    topicIds?: string[],
    authorIds?: string[],
  ): Promise<tfeed.Feed>;

  swapPosition(
    firstFeedId: string,
    secondFeedId: string,
    myUserId: string,
  ): Promise<void>;

  delete(
    feedId: string,
    myUserId: string,
  ): Promise<void>;

  update(
    feedId: string,
    myUserId: string,
    name?: string,
    topics?: string[],
    authors?: string[],
  ): Promise<svct.outputs.feed.Update>;

  getAuthors(
    feedId: string,
    myUserId?: string,
  ): Promise<tuser.UserPublicStats[]>;

  getTopics(
    feedId: string,
    myUserId?: string,
  ): Promise<ttopic.TopicStats[]>;

  getUserFeeds(
    userId: string,
  ): Promise<tfeed.Feed[]>;

  getRecommendedForUser(
    userId: string,
    topics?: string[],
    authorIds?: string[],
  ): Promise<tpost.PostStats[]>;

  getPostsById(
    feedId: string,
    myUserId?: string,
  ): Promise<tpost.PostStats[] | null>;
}

export class FeedServices implements IFeedServices {
  dataStorage: IDataStorage;

  constructor(dataStorage: IDataStorage) {
    this.dataStorage = dataStorage;
  }

  async swapPosition(
    firstFeedId: string,
    secondFeedId: string,
    myUserId: string,
  ): Promise<void> {
    const parsedFirstFeedId = uuid.parseSync(firstFeedId);
    const parsedSecondFeedId = uuid.parseSync(secondFeedId);

    await this.dataStorage._useTransaction(async (tx) => {
      const [firstFeed, secondFeed] = await Promise.all([
        tx.feed.byId(parsedFirstFeedId),
        tx.feed.byId(parsedSecondFeedId),
      ]);

      if (!firstFeed || !secondFeed) {
        throw FeedNotFound;
      }

      if (firstFeed.owner_id !== myUserId || secondFeed.owner_id !== myUserId) {
        throw NotYourFeed;
      }

      return tx.feed.swapPosition(firstFeedId, secondFeedId);
    });
  }

  async byId(feedId: string, myUserId: string) {
    const parsedFeedId = uuid.parseSync(feedId);

    const feed = await this.dataStorage.feed.byId(parsedFeedId);
    if (!feed) {
      throw FeedNotFound;
    }
    if (feed.owner_id !== myUserId) {
      throw NotYourFeed;
    }

    return feed;
  }

  async getUserFeeds(userId: string) {
    const parsedUserId = uuid.parseSync(userId);
    return this.dataStorage.feed.getUserFeeds(parsedUserId)
      .then(feeds => feeds.sort((f1, f2) => f1.position - f2.position));
  }

  create(
    ownerId: string,
    name: string,
    topicIds?: string[],
    authorIds?: string[],
  ) {
    const parsedOwnerId = uuid.parseSync(ownerId);
    const parsedFeedName = feedNameSchema.parseSync(name);
    const parsedAuthorIds = !authorIds
      ? undefined
      : feedAuthors.parseSync(authorIds);
    const parsedTopicIds = !topicIds
      ? undefined
      : feedTopics.parseSync(topicIds);

    if (
      (!parsedAuthorIds || parsedAuthorIds?.length === 0) &&
      (!parsedTopicIds || parsedTopicIds?.length === 0)
    ) {
      throw FeedTopicsAndAuthors;
    }

    if (parsedTopicIds && hasRepetitions(parsedTopicIds)) {
      throw RepeatedTopics;
    }

    if (parsedAuthorIds && hasRepetitions(parsedAuthorIds)) {
      throw RepeatedAuthors;
    }

    return this.dataStorage._useTransaction(async (tx) => {
      if (!(await tx.user.exist([parsedOwnerId])).success) {
        throw UserNotFound;
      }

      if (parsedTopicIds) {
        const topicsExist = await tx.topic.exist(parsedTopicIds);
        if (!topicsExist.success) {
          throw TopicsNotFound(topicsExist.nonExisting);
        }
      }

      if (parsedAuthorIds) {
        const authorsExist = await tx.user.exist(parsedAuthorIds);
        if (!authorsExist.success) {
          throw UsersNotFound(authorsExist.nonExisting);
        }
      }

      return tx.feed.create(
        parsedOwnerId,
        parsedFeedName,
        parsedTopicIds,
        parsedAuthorIds,
      );
    });
  }

  async delete(feedId: string, myUserId: string) {
    const parsedFeedId = uuid.parseSync(feedId);
    const parsedMyUserId = uuid.parseSync(myUserId);

    await this.dataStorage._useTransaction(async (tx) => {
      const feed = await tx.feed.byId(parsedFeedId);
      if (!feed) {
        throw FeedNotFound;
      }

      if (feed.owner_id !== parsedMyUserId) {
        throw OnlyOwnerCanPerform;
      }

      return tx.feed.delete(parsedFeedId);
    });
  }

  update(
    feedId: string,
    myUserId: string,
    name?: string | undefined,
    topics?: string[] | undefined,
    authors?: string[] | undefined,
  ) {
    const parsedMyUserId = uuid.parseSync(myUserId);
    const parsedFeedId = uuid.parseSync(feedId);
    const parsedFeedName = name ? feedNameSchema.parseSync(name) : undefined;
    const parsedTopicIds = topics ? feedTopics.parseSync(topics) : undefined;
    const parsedAuthorIds = authors
      ? feedAuthors.parseSync(authors)
      : undefined;

    if (parsedTopicIds && hasRepetitions(parsedTopicIds)) {
      throw RepeatedTopics;
    }

    if (parsedAuthorIds && hasRepetitions(parsedAuthorIds)) {
      throw RepeatedAuthors;
    }

    if (
      parsedTopicIds && parsedTopicIds.length > LogicConstraints.Feed.MAX_TOPICS
    ) {
      throw FeedTopicsAndAuthors;
    }

    if (
      parsedAuthorIds && parsedAuthorIds.length >
      LogicConstraints.Feed.MAX_AUTHORS
    ) {
      throw FeedTopicsAndAuthors;
    }

    if (
      !name &&
      (!parsedAuthorIds || parsedAuthorIds?.length === 0) &&
      (!parsedTopicIds || parsedTopicIds?.length === 0)
    ) {
      throw FeedTopicsAndAuthors;
    }

    return this.dataStorage._useTransaction(async (tx) => {
      const feed = await tx.feed.byId(parsedFeedId);
      if (!feed) {
        throw FeedNotFound;
      }

      if (feed.owner_id !== parsedMyUserId) {
        throw OnlyOwnerCanPerform;
      }

      if (parsedTopicIds) {
        const topicsExist = await tx.topic.exist(parsedTopicIds);
        if (!topicsExist.success) {
          throw TopicsNotFound(topicsExist.nonExisting);
        }
      }

      if (parsedAuthorIds) {
        const authorsExist = await tx.user.exist(parsedAuthorIds);
        if (!authorsExist.success) {
          throw UsersNotFound(authorsExist.nonExisting);
        }
      }

      return tx.feed.update(
        feedId,
        parsedFeedName,
        parsedTopicIds,
        parsedAuthorIds,
      );
    });
  }

  getAuthors(
    feedId: string,
    myUserId?: string | undefined,
  ): Promise<tuser.UserPublicStats[]> {
    const parsedFeedId = uuid.parseSync(feedId);
    const parsedMyUserId = !myUserId ? undefined : uuid.parseSync(myUserId);

    return this.dataStorage._useTransaction(async (tx) => {
      if (!(await tx.feed.byId(parsedFeedId))) {
        throw FeedNotFound;
      }

      return tx.feed.getAuthors(parsedFeedId, parsedMyUserId);
    });
  }

  getTopics(
    feedId: string,
    myUserId?: string | undefined,
  ): Promise<ttopic.TopicStats[]> {
    const parsedFeedId = uuid.parseSync(feedId);
    const parsedMyUserId = !myUserId ? undefined : uuid.parseSync(myUserId);

    return this.dataStorage._useTransaction(async (tx) => {
      if (!(await tx.feed.byId(parsedFeedId))) {
        throw FeedNotFound;
      }

      return tx.feed.getTopics(parsedFeedId, parsedMyUserId);
    });
  }

  getRecommendedForUser(
    userId: string,
    topics?: string[] | undefined,
    authors?: string[] | undefined,
  ): Promise<tpost.PostStats[]> {
    const parsedUserId = uuid.parseSync(userId);
    const parsedAuthorIds = !authors ? undefined : authors.map(uuid.parseSync);
    const parsedTopicIds = !topics
      ? undefined
      : topics.map(topicNameSchema.parseSync);

    return this.dataStorage.feed.getHomeFeed(
      parsedUserId,
      parsedTopicIds,
      parsedAuthorIds,
    );
  }

  getPostsById(
    feedId: string,
    myUserId?: string | undefined,
  ): Promise<tpost.PostStats[] | null> {
    const parsedFeedId = uuid.parseSync(feedId);
    const parsedMyUserId = !myUserId ? undefined : uuid.parseSync(myUserId);

    return this.dataStorage._useTransaction(async (tx) => {
      if (!(await tx.feed.byId(parsedFeedId))) {
        throw FeedNotFound;
      }

      return this.dataStorage.feed.getPostsById(parsedFeedId, parsedMyUserId);
    });
  }
}
