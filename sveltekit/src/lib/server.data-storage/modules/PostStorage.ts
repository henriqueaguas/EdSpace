import { PrismaDataStorageComponent } from "../_TransactionalStorage";

export interface IPostStorage {
  create(postMd: dst.inputs.post.Create): Promise<tpost.Post["id"]>;
  delete(postId: string): Promise<tpost.Post["id"]>;

  rate(postId: string, userId: string, rating: number): Promise<void>;
  view(postId: string, userId: string): Promise<void>;
  hasViewed(postId: string, userId: string): Promise<boolean>;
  exists(postId: string): Promise<boolean>;
}

export class PrismaPostStorage extends PrismaDataStorageComponent
  implements IPostStorage {
  async exists(postId: string): Promise<boolean> {
    return this._prismaClient.post
      .count({
        where: {
          id: postId,
        },
      })
      .then((c) => c > 0);
  }

  async create(input: dst.inputs.post.Create) {
    const { topics, ...postMd } = input;
    return this._prismaClient.post
      .create({
        data: postMd,
        include: { author: true },
      })
      .then(async (post) => {
        // Associate post with topics
        await this._prismaClient.post_topic.createMany({
          data: topics.map((topic) => ({
            topic_id: topic,
            post_id: post.id,
          })),
        });
        return post.id;
      });
  }

  async delete(postId: string) {
    return this._prismaClient.post
      .delete({
        where: {
          id: postId,
        },
        include: {
          author: true,
        },
      })
      .then((post) => post.id);
  }

  async rate(postId: string, userId: string, rating: number): Promise<void> {
    await this._prismaClient.post_rating.upsert({
      where: {
        user_id_post_id: {
          post_id: postId,
          user_id: userId,
        },
      },
      create: {
        post_id: postId,
        user_id: userId,
        rating: rating,
      },
      update: {
        rating: rating,
      },
    });
  }

  async view(postId: string, userId: string): Promise<void> {
    await this._prismaClient.post_view.create({
      data: {
        post_id: postId,
        user_id: userId,
      },
    });
  }

  async hasViewed(postId: string, userId: string): Promise<boolean> {
    return this._prismaClient.post_view
      .count({
        where: {
          post_id: postId,
          user_id: userId
        },
      })
      .then((c) => c === 1);
  }
}
