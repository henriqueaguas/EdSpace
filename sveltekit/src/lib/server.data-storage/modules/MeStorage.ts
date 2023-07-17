import { PrismaDataStorageComponent } from "../_TransactionalStorage";

export interface IMeStorage {
  delete(userId: string): Promise<tuser.UserPrivateStats["id"]>;

  updateName(userId: string, newUsername: string): Promise<void>;
  updateProfilePicture(userId: string, imageUrl: string): Promise<void>;

  hasCompletedSignUp(userId: string): Promise<boolean>
  completeSignUp(userId: string): Promise<void>

  existsInSavedPosts(userId: string, postId: string): Promise<boolean>;
  addToSavedPosts(userId: string, postId: string): Promise<void>;
  deleteFromSavedPosts(userId: string, postId: string): Promise<void>;
}

export class PrismaMeStorage extends PrismaDataStorageComponent
  implements IMeStorage {
  async hasCompletedSignUp(userId: string): Promise<boolean> {
    return this._prismaClient.user.findUnique({
      where: {
        id: userId
      },
      select: {
        signupComplete: true
      }
    }).then(res => res?.signupComplete || false)
  }

  async completeSignUp(userId: string): Promise<void> {
    await this._prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        signupComplete: true
      }
    })
  }

  async delete(userId: string) {
    return this._prismaClient.user
      .delete({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      })
      .then((p) => p.id);
  }

  async updateName(userId: string, newusername: string) {
    await this._prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        name: newusername,
        name_updated_at: new Date(),
      },
    });
  }

  async updateProfilePicture(userId: string, imageUrl: string) {
    await this._prismaClient.user.update({
      where: {
        id: userId,
      },

      data: {
        image_updated_at: new Date(),
        image: imageUrl,
      },
    });
  }

  async addToSavedPosts(userId: string, postId: string) {
    await this._prismaClient.saved_post.create({
      data: {
        user_id: userId,
        post_id: postId,
      },
    });
  }

  async existsInSavedPosts(userId: string, postId: string) {
    return this._prismaClient.saved_post.count({
      where: {
        user_id: userId,
        post_id: postId,
      },
    }).then((c) => c > 0);
  }

  async deleteFromSavedPosts(userId: string, postId: string) {
    await this._prismaClient.saved_post.delete({
      where: {
        user_id_post_id: {
          user_id: userId,
          post_id: postId,
        },
      },
    });
  }
}
