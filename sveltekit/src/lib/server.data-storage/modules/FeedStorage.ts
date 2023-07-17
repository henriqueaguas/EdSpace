import type { PrismaClient } from "@prisma/client";
import { UserPublicStatsSchema } from "../OutputTransformers/user";
import {
  forceRunInTransaction,
  PrismaDataStorageComponent,
  type TransactionalPrismaClient,
} from "../_TransactionalStorage";
import { TopicStatsSchema } from "../OutputTransformers/topic";
import { LogicConstraints } from "$lib/services/constraints";
import { shuffleArray } from "../../../../tests/utils";
import { PostStatsSchema } from "../OutputTransformers/post";

export interface IFeedStorage {
  byId(feedId: string): Promise<tfeed.Feed | null>;

  create(
    ownerId: string,
    name: string,
    topics?: string[],
    authors?: string[],
  ): Promise<tfeed.Feed>;

  delete(
    feedId: string,
  ): Promise<tfeed.Feed>;

  update(
    feedId: string,
    name?: string,
    topics?: string[],
    authors?: string[],
  ): Promise<{ feed: tfeed.Feed; topics: string[]; authors: string[] }>;

  swapPosition(
    firstFeedId: string,
    secondFeedId: string,
  ): Promise<void>;

  getAuthors(
    feedId: string,
    myUserId?: string,
  ): Promise<tuser.UserPublicStats[]>;

  authorsCount(
    feedId: string,
  ): Promise<number>;

  getUserFeeds(
    userId: string,
  ): Promise<tfeed.Feed[]>;

  getTopics(feedId: string, myUserId?: string): Promise<ttopic.TopicStats[]>;

  topicsCount(
    feedId: string,
  ): Promise<number>;

  getPostsById(
    feedId: string,
    myUserId?: string,
  ): Promise<tpost.PostStats[] | null>;

  getHomeFeed(
    myUserId: string,
    topics?: string[],
    authors?: string[],
  ): Promise<tpost.PostStats[]>;
}

export class PrismaFeedStorage extends PrismaDataStorageComponent
  implements IFeedStorage {
  swapPosition(
    firstFeedId: string,
    secondFeedId: string,
  ): Promise<void> {
    return forceRunInTransaction(
      this._prismaClient,
      async (tx) => {
        const [firstPos, secondPos] = await Promise.all([
          tx.feed.findUnique({
            where: {
              id: firstFeedId,
            },
            select: {
              position: true,
            },
          }).then((f) => f!.position),
          tx.feed.findUnique({
            where: {
              id: secondFeedId,
            },
            select: {
              position: true,
            },
          }).then((f) => f!.position),
        ]);

        // swap
        await Promise.all([
          tx.feed.update({
            where: {
              id: firstFeedId,
            },
            data: {
              position: secondPos,
            },
          }),
          tx.feed.update({
            where: {
              id: secondFeedId,
            },
            data: {
              position: firstPos,
            },
          }),
        ]);
      },
    );
  }

  update(
    feedId: string,
    name?: string | undefined,
    topics?: string[] | undefined,
    authors?: string[] | undefined,
  ) {
    return forceRunInTransaction(
      this._prismaClient,
      async (tx) =>
        tx.feed.update({
          where: {
            id: feedId,
          },
          include: {
            feed_author: {
              select: {
                author_id: true,
              },
            },
            feed_topic: {
              select: {
                topic_id: true,
              },
            },
          },
          data: {
            name: name,
            updated_at: new Date(),

            feed_topic: {
              deleteMany: {
                feed_id: feedId,
              },
              createMany: topics
                ? {
                  data: topics.map((tid) => ({ topic_id: tid })),
                  skipDuplicates: true,
                }
                : undefined,
            },
            feed_author: {
              deleteMany: {
                feed_id: feedId,
              },
              createMany: authors
                ? {
                  data: authors.map((aid) => ({ author_id: aid })),
                  skipDuplicates: true,
                }
                : undefined,
            },
          },
        }).then((feed) => ({
          feed: {
            id: feed.id,
            name: feed.name,
            created_at: feed.created_at,
            position: feed.position,
            owner_id: feed.owner_id,
            updated_at: feed.updated_at,
          } satisfies tfeed.Feed,
          topics: feed.feed_topic.map((t) => t.topic_id),
          authors: feed.feed_author.map((a) => a.author_id),
        })),
    );
  }

  authorsCount(feedId: string): Promise<number> {
    return this._prismaClient.feed_author.count({
      where: {
        feed_id: feedId,
      },
    });
  }

  topicsCount(feedId: string): Promise<number> {
    return this._prismaClient.feed_topic.count({
      where: {
        feed_id: feedId,
      },
    });
  }

  getUserFeeds(userId: string) {
    return this._prismaClient.feed.findMany({
      where: {
        owner_id: userId,
      },
    });
  }

  byId(feedId: string) {
    return this._prismaClient.feed.findUnique({
      where: {
        id: feedId,
      },
    });
  }

  create(
    ownerId: string,
    name: string,
    topics?: string[],
    authors?: string[],
  ) {
    return forceRunInTransaction(
      this._prismaClient,
      async (tx) =>
        tx.feed.create({
          data: {
            owner_id: ownerId,
            name: name,
            position: (await this._maxPosition(tx, ownerId)) + 1,
            feed_author: {
              createMany: {
                data: (authors || []).map((aid) => ({ author_id: aid })),
              },
            },
            feed_topic: {
              createMany: {
                data: (topics || []).map((tid) => ({ topic_id: tid })),
              },
            },
          },
        }),
    );
  }

  async _maxPosition(
    prismaClient: PrismaClient | TransactionalPrismaClient,
    ownerId: string,
  ): Promise<number> {
    return prismaClient.feed.findFirst({
      where: {
        owner_id: ownerId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    }).then((r) => r?.position || 0);
  }

  delete(feedId: string) {
    return this._prismaClient.feed.delete({
      where: {
        id: feedId,
      },
    });
  }

  async getTopics(
    feedId: string,
  ) {
    return this._prismaClient.feed_topic.findMany({
      where: {
        feed_id: feedId,
      },
      include: {
        topic: {
          include: {
            topic_stats: true,
          },
        },
      },
    }).then((topics) =>
      topics.map((t) => t.topic.topic_stats[0]).map(TopicStatsSchema.parseSync)
    );
  }

  async getAuthors(
    feedId: string,
  ) {
    return this._prismaClient.feed_author.findMany({
      where: {
        feed_id: feedId,
      },
      include: {
        user: {
          include: {
            user_stats: true,
          },
        },
      },
    }).then((rss) =>
      rss.map((r) => r.user.user_stats[0]).map(UserPublicStatsSchema.parseSync)
    );
  }

  async getPostsById(
    feedId: string,
    myUserId?: string,
  ) {
    return forceRunInTransaction(
      this._prismaClient,
      async (tx) => {
        const feedTopicsAndAuthors = await tx.feed.findUnique({
          where: {
            id: feedId,
          },
          include: {
            feed_topic: true,
            feed_author: true,
          },
        }).then((result) =>
          !result ? null : ({
            topics: result?.feed_topic.map((i) => i.topic_id),
            authors: result?.feed_author.map((i) => i.author_id),
          })
        );

        if (feedTopicsAndAuthors === null) {
          return null;
        }

        const { topics, authors } = feedTopicsAndAuthors;

        return this._getPosts(
          tx,
          topics,
          authors,
          myUserId,
        );
      },
    );
  }

  async _getPosts(
    prismaClient: PrismaClient | TransactionalPrismaClient,
    topics?: string[],
    authors?: string[],
    myUserId?: string,
  ) {
    const feed = await forceRunInTransaction(
      prismaClient,
      async (tx) =>
        tx.post_stats
          .findMany({
            where: {
              post: {
                // User has not seen yet
                post_view: {
                  none: {
                    user_id: myUserId,
                  },
                },
              },
              OR: [{
                topics: topics
                  ? {
                    hasSome: topics,
                  }
                  : undefined,
              }, {
                author_id: authors
                  ? {
                    in: authors,
                  }
                  : undefined,
              }],
            },
            include: {
              author: true,
            },
            orderBy: {
              score: "desc",
            },
            take: LogicConstraints.Posts.USER_FEED_POSTS,
          })
          .then((posts) => posts.map(PostStatsSchema.parseSync)),
    );

    return shuffleArray(feed);
  }

  async getHomeFeed(myUserId: string) {
    const feed = await forceRunInTransaction(
      this._prismaClient,
      async (tx) => {
        const [followingUserIds, followingTopicIds] = await Promise.all([
          tx.user_follow.findMany({
            where: {
              follower_id: myUserId
            }
          }).then(us => us.map(u => u.user_id)),

          tx.topic_follow.findMany({
            where: {
              follower_id: myUserId
            }
          }).then(ts => ts.map(t => t.topic_id))
        ])

        return tx.post_stats
          .findMany({
            where: {
              post: {
                // User has not seen yet
                post_view: {
                  none: {
                    user_id: myUserId,
                  },
                },
              },
              OR: [
                // Authors the user follows, if any
                {
                  author_id: followingUserIds.length === 0 ? undefined : {
                    in: followingUserIds
                  },
                },
                // If user is not following any topics: show from any topic, otherwise only show from topics he follows
                {
                  topics: followingTopicIds.length === 0 ? undefined : {
                    hasSome: followingTopicIds
                  }
                }
              ]
            },
            include: {
              author: true,
            },
            orderBy: {
              score: "desc",
            },
            take: LogicConstraints.Posts.USER_FEED_POSTS,
          })
      })
      .then((posts) => posts.map(PostStatsSchema.parseSync))

    return shuffleArray(feed);
  }
}
