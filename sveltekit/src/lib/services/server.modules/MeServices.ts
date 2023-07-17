import { blobStorage } from "$lib/index.server";
import {
  LargeImageSize,
  PostNotFound,
  UserNotFound,
  UserUpdateImageConstraint,
  UserUpdateNameConstraint,
} from "$lib/_errors/LogicError";
import type { IBlobStorage } from "$lib/server.blob-storage/IBlobStorage";
import type { ResultWithPaging } from "$lib/utils/Paging";
import { usernameSchema, uuid } from "../InputValidators/commonValidators";
import { LogicConstraints } from "../constraints";
import type { IDataStorage } from "$lib/server.data-storage/IDataStorage";

export interface IMeServices {
  get(myUserId: string): Promise<tuser.UserPrivateStats>;
  delete(userId: string): Promise<tpost.Post["id"]>;

  hasCompletedSignUp(userId: string): Promise<boolean>
  completeSignUp(userId: string): Promise<void>

  update(userId: string, image?: Blob, name?: string): Promise<void>;

  savedPosts(userId: string): Promise<ResultWithPaging<tpost.PostStats>>;
  addToSavedPosts(userId: string, postId: string): Promise<void>;
  deleteFromSavedPosts(userId: string, postId: string): Promise<void>;
}

export class MeServices implements IMeServices {
  dataStorage: IDataStorage;
  blobStorage: IBlobStorage;

  constructor(
    dataStorage: IDataStorage,
    blobStorage: IBlobStorage,
  ) {
    this.dataStorage = dataStorage;
    this.blobStorage = blobStorage;
  }

  hasCompletedSignUp(userId: string) {
    const parsedId = uuid.parseSync(userId);

    return this.dataStorage._useTransaction(async (tx) => {
      if (!((await tx.user.exist([parsedId])).success)) {
        throw UserNotFound;
      }

      return tx.me.hasCompletedSignUp(parsedId);
    });
  }

  async completeSignUp(userId: string) {
    const parsedId = uuid.parseSync(userId);

    await this.dataStorage._useTransaction(async (tx) => {
      if (!((await tx.user.exist([parsedId])).success)) {
        throw UserNotFound;
      }

      await tx.me.completeSignUp(parsedId);
    });
  }

  async delete(userId: string) {
    const parsedId = uuid.parseSync(userId);

    return this.dataStorage._useTransaction(async (tx) => {
      if (!((await tx.user.exist([parsedId])).success)) {
        throw UserNotFound;
      }

      return tx.me.delete(parsedId);
    });
  }

  async get(myUserId: string) {
    const user = await this.dataStorage.userStats.privateById(myUserId);
    if (!user) {
      throw UserNotFound;
    }
    return user;
  }

  async update(
    userId: string,
    image?: Blob,
    name?: string
  ) {
    const parsedId = uuid.parseSync(userId);
    const parsedUsername = name ? usernameSchema.parseSync(name) : undefined;

    await this.dataStorage._useTransaction(async (tx) => {
      const user = await tx.userStats.privateById(parsedId);

      if (!user) {
        throw UserNotFound;
      }

      if (image) {
        if (user.image_updated_at) {
          if (
            Date.now() - user.image_updated_at.getTime() <
            LogicConstraints.User.UPDATE_IMAGE_TIME_MS
          ) {
            throw UserUpdateImageConstraint;
          }
        }

        // Image is the image data. Store in blob storage and store link pointing to it in database
        if (image.length * 1024 * 1024 > LogicConstraints.User.PROFILE_PICTURE.MAX_IMAGE_SIZE_MB) {
          throw LargeImageSize;
        }

        const imageUrl = await blobStorage.uploadProfilePicture(
          parsedId,
          image,
        );

        await tx.me.updateProfilePicture(parsedId, imageUrl);
      }

      if (parsedUsername) {
        if (user.name_updated_at != null) {
          if (
            Date.now() - user.name_updated_at.getTime() <
            LogicConstraints.User.UPDATE_NAME_TIME_MS
          ) {
            throw UserUpdateNameConstraint;
          }
        }

        await tx.me.updateName(parsedId, parsedUsername);
      }
    });
  }

  async savedPosts(userId: string) {
    const parsedUserId = uuid.parseSync(userId);

    return this.dataStorage._useTransaction(async (tx) => {
      if (!(await tx.user.exist([parsedUserId])).success) {
        throw UserNotFound;
      }

      return tx.postStats.savedByUser(parsedUserId);
    });
  }

  async addToSavedPosts(userId: string, postId: string) {
    const parsedId = uuid.parseSync(userId);
    const parsedPostId = uuid.parseSync(postId);

    return this.dataStorage._useTransaction(async (tx) => {
      if (!(await tx.user.exist([parsedId])).success) {
        throw UserNotFound;
      }

      if (!(await tx.post.exists(parsedPostId))) {
        throw PostNotFound;
      }

      if (!(await tx.me.existsInSavedPosts(parsedId, parsedPostId))) {
        await tx.me.addToSavedPosts(parsedId, parsedPostId);
      }
    });
  }

  async deleteFromSavedPosts(userId: string, postId: string) {
    const parsedUserId = uuid.parseSync(userId);
    const parsedPostId = uuid.parseSync(postId);

    return this.dataStorage._useTransaction(async (tx) => {
      if (!(await tx.user.exist([parsedUserId])).success) {
        throw UserNotFound;
      }

      if (!(await tx.post.exists(parsedPostId))) {
        throw PostNotFound;
      }

      if (await tx.me.existsInSavedPosts(parsedUserId, parsedPostId)) {
        await tx.me.deleteFromSavedPosts(parsedUserId, parsedPostId);
      }
    });
  }
}
