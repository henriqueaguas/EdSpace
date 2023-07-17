import jetpack from "fs-jetpack";
import { afterEach, assert, beforeAll, describe, test } from "vitest";
import { v4 as generateUUID } from "uuid";
import { getBlobFromFile } from "./utils";
import { assertDoesNotThrow } from "../assertionFunctions";
import { blobStorage } from "$lib/index.server";

const testPostPages = jetpack.cwd("tests/blob-storage/mock-post-pages");
const testProfilePictures = jetpack.cwd(
  "tests/blob-storage/mock-profile-pictures",
);

describe("Mock Blob Storage", () => {
  beforeAll(async () => {
    await blobStorage.clearAll();
  });

  afterEach(async () => {
    await blobStorage.clearAll();
  });

  test("Upload Picture", async () => {
    const testUserId = generateUUID();
    const profilePictureName = "image.jpeg";
    await getBlobFromFile(testProfilePictures, profilePictureName, "JPEG").then(
      (
        picture,
      ) =>
        assertDoesNotThrow(
          blobStorage.uploadProfilePicture(testUserId, picture),
        ),
    );
  });

  test("Update/Overwrite Picture", async () => {
    const testUserId = generateUUID();
    const profilePictureName = "image.jpeg";
    await getBlobFromFile(testProfilePictures, profilePictureName, "JPEG").then(
      async (picture) => {
        assertDoesNotThrow(
          blobStorage.uploadProfilePicture(testUserId, picture),
        );

        assertDoesNotThrow(
          blobStorage.uploadProfilePicture(testUserId, picture),
        );
      },
    );
  });

  test("Upload Post Pages", async () => {
    const testPostId = generateUUID();

    await Promise.all(
      testPostPages.list()!.map(async (name) => {
        return getBlobFromFile(testPostPages, name);
      }),
    ).then((postPages) => blobStorage.uploadPostPages(testPostId, postPages));

    // It takes some time for the files to be visible.
    const posts = await blobStorage.getPostPages(testPostId);

    assert(posts !== null);
    assert(posts.length === 3);
  });

  test("Delete Post Pages", async () => {
    const testPostId = generateUUID();

    await Promise.all(
      testPostPages.list()!.map(async (name) =>
        getBlobFromFile(testPostPages, name)
      ),
    ).then((postPages) => blobStorage.uploadPostPages(testPostId, postPages));

    const posts = await blobStorage.getPostPages(testPostId);

    assert(posts !== null);
    assert(posts.length === 3);

    // Delete

    await blobStorage.deletePostPages(testPostId);

    // Assert it does not exist anymore
    assert((await blobStorage.getPostPages(testPostId)) === null);
  });
});
