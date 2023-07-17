import { blobStorage, services } from "$lib/index.server";
import { prismaClient } from "$lib/index.server";
import {
  afterAll,
  afterEach,
  assert,
  beforeAll,
  beforeEach,
  describe,
  test,
} from "vitest";
import { TEST_USER_1, TEST_USER_2, invalidPostPage, testPostPages, validCreatePostData, validDescription, validDifficulty, validTitle, validTopics } from "../objects";
import { getBlobFromFile } from "../blob-storage/utils";
import {
  CannotRateOwnPost,
  InvalidFileType,
  OnlyOwnerCanPerform,
  PostAlreadyViewed,
  PostNotFound,
  PostPagesConstraint,
} from "$lib/_errors/LogicError";
import { v4 as generateUUID } from "uuid";
import { assertThrows } from "../assertionFunctions";

let testUserId: tuser.UserPrivateStats["id"];

describe("[SERVICE] - Posts", async () => {
  beforeAll(async () => {
    await Promise.all([
      prismaClient.user.deleteMany(),
      prismaClient.post.deleteMany(),
      blobStorage.clearAll(),
    ]);

    testUserId = await services.user.create(TEST_USER_1);
  });

  afterAll(async () => {
    await Promise.all([
      prismaClient.user.deleteMany(),
      prismaClient.post.deleteMany(),
      blobStorage.clearAll(),
    ]);
  });

  const validPostPages: Blob[] = await Promise.all(
    testPostPages.list()!.map(async (name) =>
      getBlobFromFile(testPostPages, name)
    ),
  );

  describe("CREATE", () => {
    afterAll(async () => {
      await prismaClient.post.deleteMany();
    });

    test("Success", async () => {
      const newPostId = await services.post.create(
        testUserId,
        validCreatePostData,
        validPostPages,
      );

      // Get post after create
      const post = await services.post.byId(newPostId);

      assert(post != null);
      assert(post.metadata.id === newPostId);

      validTopics.forEach((t) => assert(post.metadata.topics.includes(t)));
    });

    test("[FAIL] No pages", async () => {
      await assertThrows(
        services.post.create(
          testUserId,
          {
            title: validTitle,
            description: validDescription,
            difficulty: validDifficulty,
            topics: validTopics,
          },
          [],
        ),
        PostPagesConstraint,
      );
    });

    test("[FAIL] No topics", async () => {
      await assertThrows(
        services.post.create(
          testUserId,
          {
            title: validTitle,
            description: validDescription,
            difficulty: validDifficulty,
            topics: [], // no topics
          },
          validPostPages,
        ),
        undefined,
        true,
      );
    });
    test("[FAIL] Too many topics + repeated topics", async () => {
      await assertThrows(
        services.post.create(
          testUserId,
          {
            title: validTitle,
            description: validDescription,
            difficulty: validDifficulty,
            topics: [...validTopics, validTopics[0]], // no topics
          },
          validPostPages,
        ),
        undefined,
        true,
      );
    });
    test("[FAIL] Title too short", async () => {
      await assertThrows(
        services.post.create(
          testUserId,
          {
            title: "Short",
            description: validDescription,
            difficulty: validDifficulty,
            topics: validTopics,
          },
          validPostPages,
        ),
        undefined,
        true,
      );
    });
    test("[FAIL] Title too long", async () => {
      await assertThrows(
        services.post.create(
          testUserId,
          {
            title:
              "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            description: validDescription,
            difficulty: validDifficulty,
            topics: validTopics,
          },
          validPostPages,
        ),
        undefined,
        true,
      );
    });
    test("[FAIL] Invalid file as post page", async () => {
      await assertThrows(
        services.post.create(
          testUserId,
          {
            title: validTitle,
            description: validDescription,
            difficulty: validDifficulty,
            topics: validTopics,
          },
          [invalidPostPage],
        ),
        InvalidFileType,
      );
    });
  });

  describe("GET BY ID", () => {
    let testPost: svct.outputs.post.ById<"pages">;

    beforeAll(async () => {
      testPost = await services.post.create(
        testUserId,
        validCreatePostData,
        validPostPages,
      ).then((pid) => services.post.byId(pid, { pages: true }));
    });

    afterAll(async () => {
      await services.post.delete(testPost.metadata.id, testUserId);
    });

    test("Success no pages", async () => {
      const post = await services.post.byId(testPost.metadata.id);

      assert(post.pages === undefined);

      assert(post.metadata.id === testPost.metadata.id);
      assert(post.metadata.title === testPost.metadata.title);
      assert(post.metadata.description === testPost.metadata.description);
      assert(post.metadata.author.id === testPost.metadata.author.id);

      assert(post.metadata.avg_rating === 0);
      assert(post.metadata.rates_count === 0);
      assert(post.metadata.views_count === 0);
    });

    test("Success with pages", async () => {
      const post = await services.post.byId(testPost.metadata.id, {
        pages: true,
      });

      assert(post.pages !== undefined);
      assert(post.pages[0].type === "Image");
      assert(post.pages[0].remoteUrl !== undefined);

      assert(post.pages[1].type === "Quiz");
      assert(typeof post.pages[1].quiz === "object");
      assert("name" in post.pages[1].quiz);
      assert("questions" in post.pages[1].quiz);

      assert(post.pages[2].type === "Markdown");
      assert(post.pages[2].remoteUrl !== undefined);
    });

    test("[FAIL] Not Exists", async () => {
      await assertThrows(services.post.byId(generateUUID()), PostNotFound);
    });
  });

  describe("DELETE", () => {
    let testPost: svct.outputs.post.ById<"pages">;

    beforeEach(async () => {
      testPost = await services.post.create(
        testUserId,
        validCreatePostData,
        validPostPages,
      ).then((pid) => services.post.byId(pid, { pages: true }));
    });

    afterEach(async () => {
      try {
        await services.post.delete(testPost.metadata.id, testUserId);
      } catch (e) {
        // Some of the tests might delete the test post so it's normal to error here since it might not exist anymore
      }
    });

    test("Success", async () => {
      const postId = await services.post.delete(
        testPost.metadata.id,
        testUserId,
      );

      assert(postId === testPost.metadata.id);
      assert(typeof postId === "string");

      await assertThrows(
        services.post.byId(testPost.metadata.id),
        PostNotFound,
      );
    });

    test("[FAIL] Not Exists", async () => {
      await assertThrows(
        services.post.delete(generateUUID(), testUserId),
        PostNotFound,
      );
    });

    test("[FAIL] Delete post from another user", async () => {
      try {
        const user2Id = await services.user.create(TEST_USER_2);

        await assertThrows(
          services.post.delete(testPost.metadata.id, user2Id),
          OnlyOwnerCanPerform,
        );
      } finally {
        await prismaClient.user.delete({
          where: {
            email: TEST_USER_2.email
          }
        });
      }
    });
  });

  describe("SEARCH", () => {
    let testPost: svct.outputs.post.ById<"pages">;

    beforeAll(async () => {
      testPost = await services.post.create(
        testUserId,
        validCreatePostData,
        validPostPages,
      ).then((pid) => services.post.byId(pid, { pages: true }));
    });

    afterAll(async () => {
      await services.post.delete(
        testPost.metadata.id,
        testUserId,
      );
    });

    test("Success", async () => {
      const result = await services.post.search({
        q: testPost.metadata.title.substring(0, 5),
      });

      assert(result.count > 0);
      assert(result.data.length === result.count);
      assert(!result.hasMore);
    });

    test("[FAIL] Empty Results", async () => {
      const results = await services.post.search({
        q: "This post does not exist",
      });

      assert(results.count === 0);
      assert(results.data.length === 0);
      assert(!results.hasMore);
    });
  });

  describe("RATE", () => {
    let testPost: svct.outputs.post.ById<"pages">;
    let testUser2Id: tuser.UserPrivateStats["id"];

    beforeEach(async () => {
      testPost = await services.post.create(
        testUserId,
        validCreatePostData,
        validPostPages,
      ).then((pid) => services.post.byId(pid, { pages: true }));
      testUser2Id = await services.user.create(TEST_USER_2);
    });

    afterEach(async () => {
      await services.post.delete(testPost.metadata.id, testUserId);
      await services.me.delete(testUser2Id);
    });

    test("Success", async () => {
      await services.post.rate(testPost.metadata.id, testUser2Id, 5);

      const postAfterRate = await services.post.byId(testPost.metadata.id);

      assert(postAfterRate.metadata.rates_count === 1);
      assert(postAfterRate.metadata.avg_rating === 5);
      assert(postAfterRate.metadata.ranking_position === 1);
      assert(postAfterRate.metadata.views_count === 0);
    });

    test("Override Rating", async () => {
      await services.post.rate(testPost.metadata.id, testUser2Id, 2);

      assert(
        (await services.post.byId(
          testPost.metadata.id,
          undefined,
          testUser2Id,
        ))
          .metadata.i_rated === 2,
      );

      await services.post.rate(testPost.metadata.id, testUser2Id, 5);

      assert(
        (await services.post.byId(
          testPost.metadata.id,
          undefined,
          testUser2Id,
        ))
          .metadata.i_rated === 5,
      );
    });

    test("[FAIL] Rate own post", async () => {
      await assertThrows(
        services.post.rate(testPost.metadata.id, testUserId, 5),
        CannotRateOwnPost,
      );
    });

    test("[FAIL] Invalid Rating", async () => {
      await assertThrows(
        services.post.rate(testPost.metadata.id, testUserId, -1),
        undefined,
        true,
      );
    });
  });

  describe("VIEW", () => {
    let testPostId: string;

    beforeEach(async () => {
      testPostId = await services.post.create(
        testUserId,
        validCreatePostData,
        validPostPages,
      );
    });

    afterEach(async () => {
      await services.post.delete(testPostId, testUserId);
    });

    test("Success", async () => {
      assert(
        (await services.post.byId(testPostId)).metadata
          .views_count === 0,
      );

      await services.post.view(testPostId, testUserId);

      const viewsAfter =
        (await services.post.byId(testPostId)).metadata.views_count;

      assert(viewsAfter === 1);
    });

    test("[FAIL] Repeated", async () => {
      assert(
        (await services.post.byId(testPostId)).metadata
          .views_count === 0,
      );

      await services.post.view(testPostId, testUserId);
      assert(
        (await services.post.byId(testPostId)).metadata
          .views_count === 1,
      );

      await assertThrows(
        services.post.view(testPostId, testUserId),
        PostAlreadyViewed,
      );
    });
  });

  describe("FROM USER", () => {
    let testPostId: string;

    beforeEach(async () => {
      testPostId = await services.post.create(
        testUserId,
        validCreatePostData,
        validPostPages,
      );
    });

    afterEach(async () => {
      try {
        await services.post.delete(testPostId, testUserId);
      } catch (e) {
        // IGNORE
      }
    });

    test("Success", async () => {
      const userPosts = await services.post.fromUser(testUserId);

      assert(userPosts.count === 1);
      assert(userPosts.data.length === 1);
    });

    test("User with no posts", async () => {
      await services.post.delete(testPostId, testUserId);

      const userPosts = await services.post.fromUser(testUserId);

      assert(userPosts.count === 0);
      assert(userPosts.data.length === 0);
    });
  });
});
