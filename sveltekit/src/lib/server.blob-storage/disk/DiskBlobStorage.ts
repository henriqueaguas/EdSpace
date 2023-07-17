import jetpack from "fs-jetpack";
import type { FSJetpack } from "fs-jetpack/types";
import type { IBlobStorage } from "../IBlobStorage";
import { emptyDirectory } from "../../../../tests/utils";
import {
  BLOBAllowedFileTypes,
  LogicConstraints,
} from "$lib/services/constraints";
import { BlobStorageError } from "$lib/_errors/ExternalError";
import type { IStorageBucketsConfig } from "../BucketsConfig";
import { inject, singleton } from "tsyringe";

@singleton()
export class DiskBlobStorage implements IBlobStorage {
  private _bucketsConfig: IStorageBucketsConfig;
  private _profilePicturesDir: FSJetpack;
  private _postPagesDir: FSJetpack;

  constructor(
    @inject("StorageBucketsConfig")
    bucketsConfig: IStorageBucketsConfig,
  ) {
    this._bucketsConfig = bucketsConfig;
    this._profilePicturesDir = jetpack.dir(
      `static/${this._bucketsConfig.profilePictures.name}`,
    );
    this._postPagesDir = jetpack.dir(
      `static/${this._bucketsConfig.postPages.name}`,
    );
  }

  getPostPages(postId: string) {
    return this._internalGetPostPages(this._postPagesDir.cwd(postId), postId);
  }

  private async _internalGetPostPages(
    postdir: FSJetpack,
    postId: string,
  ) {
    const postPages = postdir.list();
    if (!postPages) {
      return null;
    }

    return Promise.all(
      postdir.list()!.map((fileName) => {
        let type: tpost.PostPageType | null = null;

        if (
          fileName.endsWith(BLOBAllowedFileTypes.JPG.ext) ||
          fileName.endsWith(BLOBAllowedFileTypes.GIF.ext) ||
          fileName.endsWith(BLOBAllowedFileTypes.PNG.ext) ||
          fileName.endsWith(BLOBAllowedFileTypes.JPEG.ext)
        ) {
          type = "Image";
        } else if (fileName.endsWith(BLOBAllowedFileTypes.PDF.ext)) {
          type = "PDF";
        } else if (fileName.endsWith(BLOBAllowedFileTypes.MARKDOWN.ext)) {
          type = "Markdown";
        } else if (fileName.endsWith(BLOBAllowedFileTypes.QUIZ.ext)) {
          type = "Quiz";
        }

        if (type === "Image" || type === "Markdown" || type === "PDF") {
          return {
            type: type,
            remoteUrl:
              `/${this._bucketsConfig.postPages.name}/${postId}/${fileName}`,
          };
        }

        if (type === "Quiz") {
          const quizString = postdir.read(fileName)!;
          return {
            type,
            quiz: JSON.parse(quizString) as tquiz.Quiz,
          };
        }

        throw BlobStorageError(`Unexpected file type. File: ${fileName}`);
      }),
    );
  }

  async uploadPostPages(
    postId: string,
    pages: Blob[],
  ) {
    let pageNumber = 0;
    // creates if not exists
    const postdir = this._postPagesDir.dir(postId);

    const int = pages.map((p) => ({ page: p, nr: pageNumber++ }));
    await Promise.all(
      int.map(async ({ page, nr }) => {
        postdir.write(
          `${nr}-${Date.now()}.${LogicConstraints.Posts.FILE_TYPE_TO_EXTENSION(page.type)
          }`,
          Buffer.from(await page.arrayBuffer()),
        );
      }),
    );

    const pagesAfterCreate = await this._internalGetPostPages(postdir, postId);
    if (pagesAfterCreate === null) {
      throw BlobStorageError("Could not find post pages after created");
    }
    return pagesAfterCreate;
  }

  deletePostPages(postId: string): Promise<void> {
    return this._postPagesDir.removeAsync(postId);
  }

  async uploadProfilePicture(
    userId: string,
    image: Blob,
  ): Promise<string> {
    this._profilePicturesDir.write(
      userId,
      Buffer.from(await image.arrayBuffer()),
    );

    return this.getProfilePictureUrl(userId);
  }

  getProfilePictureUrl(userId: string): string {
    return `/${this._bucketsConfig.profilePictures.name}/${userId}`;
  }

  async clearAll() {
    await Promise.all([
      emptyDirectory(this._postPagesDir),
      emptyDirectory(this._profilePicturesDir),
    ]);
  }
}
