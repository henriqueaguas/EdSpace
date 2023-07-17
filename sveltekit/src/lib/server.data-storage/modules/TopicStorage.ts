import { PrismaDataStorageComponent } from "../_TransactionalStorage";

export interface ITopicStorage {
  follow(topicId: string, followerId: string): Promise<void>;
  unfollow(topicId: string, followerId: string): Promise<void>;

  isFollowedByUser(topicId: string, userId: string): Promise<boolean>;

  exist(
    topicIds: string[],
  ): Promise<{ success: true } | { success: false; nonExisting: string[] }>;
}

export class PrismaTopicStorage extends PrismaDataStorageComponent
  implements ITopicStorage {
  async isFollowedByUser(topicId: string, userId: string): Promise<boolean> {
    return this._prismaClient.topic_follow
      .findUnique({
        where: {
          topic_id_follower_id: {
            topic_id: topicId,
            follower_id: userId,
          },
        },
      })
      .then((r) => r !== null);
  }

  async follow(topicId: string, followerId: string): Promise<void> {
    await this._prismaClient.topic_follow.create({
      data: {
        topic_id: topicId,
        follower_id: followerId,
      },
    });
  }

  async unfollow(topicId: string, followerId: string): Promise<void> {
    await this._prismaClient.topic_follow.deleteMany({
      where: {
        AND: [{ follower_id: followerId }, { topic_id: topicId }],
      },
    });
  }

  async exist(
    topicIds: string[],
  ): Promise<{ success: true } | { success: false; nonExisting: string[] }> {
    const uniqueIds = topicIds.filter((value, index, self) =>
      self.indexOf(value) === index
    );

    const existingTopics: string[] = (
      await this._prismaClient.topic.findMany({
        where: {
          id: {
            in: uniqueIds,
          },
        },
      })
    ).map((t) => t.id);

    if (existingTopics.length === uniqueIds.length) {
      return { success: true };
    } else {
      return {
        success: false,
        nonExisting: uniqueIds.filter((it) => !existingTopics.includes(it)),
      };
    }
  }
}
