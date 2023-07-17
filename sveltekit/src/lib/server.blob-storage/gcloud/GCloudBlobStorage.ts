// More examples at: https://github.com/googleapis/nodejs-storage

import { DependencyIds, currentEnv } from "$lib/index.server";
import type { Bucket, File as GCloudFile } from "@google-cloud/storage";
import type { IBlobStorage } from "../IBlobStorage";
import { storageRW } from "./storageAccess";
import {
  BLOBAllowedFileTypes,
  LogicConstraints,
} from "$lib/services/constraints";
import { BlobStorageError } from "$lib/_errors/ExternalError";
import { inject, singleton } from "tsyringe";
import type { IStorageBucketsConfig } from "../BucketsConfig";

@singleton()
export class GCloudBlobStorage implements IBlobStorage {
  private _bucketsConfig: IStorageBucketsConfig;

  private _postPagesBucket: Bucket;
  private _profilePicturesBucket: Bucket;

  constructor(
    @inject("StorageBucketsConfig")
    bucketsConfig: IStorageBucketsConfig
  ) {
    this._bucketsConfig = bucketsConfig;
    this._postPagesBucket = storageRW.bucket(
      this._bucketsConfig.postPages.name,
    );
    this._profilePicturesBucket = storageRW.bucket(
      this._bucketsConfig.profilePictures.name,
    );
  }

  async getPostPages(postId: string) {
    // Get files from the post folder inside the bucket
    const [files] = await this._postPagesBucket.getFiles({
      prefix: postId + "/",
    });

    if (files.length === 0) {
      return null;
    }

    return (await Promise.all(files.map((file) => getPostPage(this, file))))
      .filter(
        (page) => page != null,
      ) as tpost.PostPage[];

    async function getPostPage(
      thiz: GCloudBlobStorage,
      file: GCloudFile,
    ): Promise<tpost.PostPage> {
      let type: tpost.PostPageType | null = null;
      if (
        [
          BLOBAllowedFileTypes.GIF.type,
          BLOBAllowedFileTypes.JPEG.type,
          BLOBAllowedFileTypes.JPG.type,
          BLOBAllowedFileTypes.PNG.type,
        ].includes(file.metadata.contentType)
      ) {
        type = "Image";
      } else if (BLOBAllowedFileTypes.PDF.type === file.metadata.contentType) {
        type = "PDF";
      } else if (
        BLOBAllowedFileTypes.MARKDOWN.type === file.metadata.contentType
      ) {
        type = "Markdown";
      } else if (BLOBAllowedFileTypes.QUIZ.type === file.metadata.contentType) {
        type = "Quiz";
      }

      if (type === "Image" || type === "Markdown" || type === "PDF") {
        return {
          type: type,
          // file.name should include the entire path
          remoteUrl:
            `https://storage.googleapis.com/${thiz._bucketsConfig.postPages.name}/${file.name}`,
        };
      }

      if (type === "Quiz") {
        const [contents] = await file.download();

        return {
          type,
          quiz: JSON.parse(contents.toString()) as tquiz.Quiz,
        };
      }

      throw BlobStorageError(
        `Filetype was accepted but it has no handler. Type: ${type} File: ${file.name}`,
      );
    }
  }

  uploadPostPages(postId: string, pages: Blob[]) {
    let pageNumber = 0;

    const parentThis = this;
    return Promise.all(
      pages.map((page) => uploadFile(this, pageNumber++, page)),
    );

    async function uploadFile(
      thiz: GCloudBlobStorage,
      pageNumber: number,
      file: Blob,
    ) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Upload file to bucket
      await thiz._postPagesBucket
        .file(
          `
            ${postId}/${pageNumber}-${Date.now()}
            .${LogicConstraints.Posts.FILE_TYPE_TO_EXTENSION(file.type)}
          `,
        )
        .save(buffer, {
          metadata: {
            contentType: file.type,
            cacheControl: parentThis._bucketsConfig.postPages.itemsCacheControl,
          },
        });

      // Figure out file information
      let type: tpost.PostPageType | null = null;

      if (
        Object.values(BLOBAllowedFileTypes).flatMap((c) => c.type).includes(
          file.type,
        )
      ) {
        type = "Image";
      } else if (BLOBAllowedFileTypes.PDF.type === file.type) {
        type = "PDF";
      } else if (BLOBAllowedFileTypes.MARKDOWN.type === file.type) {
        type = "Markdown";
      } else if (BLOBAllowedFileTypes.QUIZ.type === file.type) {
        type = "Quiz";
      }

      if (type === "Image" || type === "Markdown" || type === "PDF") {
        return {
          type: type,
          // file.name should include the entire path
          remoteUrl:
            `https://storage.googleapis.com/${thiz._bucketsConfig.postPages.name}/${file.name}`,
        };
      }

      if (type === "Quiz") {
        return {
          type,
          quiz: JSON.parse(await file.text()) as tquiz.Quiz,
        };
      }

      throw BlobStorageError(
        `Filetype was accepted but it has no handler. File: ${BLOBAllowedFileTypes.QUIZ.type} ${type} ${file.type} ${file.name}`,
      );
    }
  }

  deletePostPages(postId: string) {
    return this._postPagesBucket.deleteFiles({
      prefix: postId + "/",
    });
  }

  async uploadProfilePicture(
    userId: string,
    image: Blob,
  ): Promise<string> {
    const buffer = Buffer.from(await image.arrayBuffer());
    await this._profilePicturesBucket.file(userId)
      .save(buffer, {
        metadata: {
          cacheControl: this._bucketsConfig.profilePictures.itemsCacheControl,
        },
      });

    return this.getProfilePictureUrl(userId);
  }

  getProfilePictureUrl(userId: string): string {
    return `https://storage.googleapis.com/${this._bucketsConfig.profilePictures}/${userId}`;
  }

  async clearAll() {
    await Promise.all([
      this._postPagesBucket.deleteFiles(),
      this._profilePicturesBucket.deleteFiles(),
    ]);
  }
}
