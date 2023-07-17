import { PrismaDataStorageComponent } from "../_TransactionalStorage";

export interface IUserStorage {
  create(input: dst.inputs.user.Create): Promise<tuser.UserPrivateStats["id"]>;

  isFollowedByUser(userId: string, followerId: string): Promise<boolean>;
  follow(followerId: string, userId: string): Promise<void>;
  unfollow(followerId: string, userId: string): Promise<void>;

  existsByUsername(name: string): Promise<boolean>

  exist(
    userIds: string[],
  ): Promise<{ success: true } | { success: false; nonExisting: string[] }>;
}

export class PrismaUserStorage extends PrismaDataStorageComponent
  implements IUserStorage {
  async existsByUsername(name: string): Promise<boolean> {
    return this._prismaClient.user.findFirst({
      where: {
        name: name
      }
    }).then(u => u !== null)
  }

  async exist(
    userIds: string[],
  ): Promise<{ success: true } | { success: false; nonExisting: string[] }> {
    const uniqueIds = userIds.filter((value, index, self) =>
      self.indexOf(value) === index
    );
    const existingUserIds: string[] = await this._prismaClient.user
      .findMany({
        where: {
          id: {
            in: uniqueIds,
          },
        },
      })
      .then((results) => results.map((u) => u.id));

    if (uniqueIds.length === existingUserIds.length) {
      return { success: true };
    } else {
      return {
        success: false,
        nonExisting: uniqueIds.filter((it) => !existingUserIds.includes(it)),
      };
    }
  }

  async create(input: dst.inputs.user.Create) {
    return this._prismaClient.user
      .create({
        data: input,
      })
      .then((p) => p.id);
  }

  async follow(followerId: string, userId: string): Promise<void> {
    await this._prismaClient.user_follow.create({
      data: {
        user_id: userId,
        follower_id: followerId,
      },
    });
  }

  async unfollow(followerId: string, userId: string): Promise<void> {
    await this._prismaClient.user_follow.delete({
      where: {
        user_id_follower_id: {
          user_id: userId,
          follower_id: followerId,
        },
      },
    });
  }

  async isFollowedByUser(userId: string, followerId: string): Promise<boolean> {
    return this._prismaClient.user_follow
      .findUnique({
        where: {
          user_id_follower_id: {
            user_id: userId,
            follower_id: followerId,
          },
        },
      })
      .then((r) => r !== null);
  }
}
