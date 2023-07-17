import { afterEach, assert, beforeEach, describe, test } from "vitest";
import { assertThrows } from "../assertionFunctions";
import {
  NotFollowingTopic,
  TopicNotFound,
} from "../../src/lib/_errors/LogicError";
import { services } from "$lib/index.server";
import { TEST_USER_1 } from "../objects";
import { pickRandom } from "../utils";

describe("[SERVICE] - Topics", () => {
  describe("SEARCH", () => {
    test("Search All", async () => {
      const { count, data } = await services.topic.search();

      assert(count > 0);

      const firstTopic = data[0];
      assert(data.length === count);
      assert(firstTopic.followers_count === 0);
      assert(firstTopic.posts_count === 0);
    });

    test("Search with query", async () => {
      const searchTerm = "Science".toLowerCase();
      const { count, data } = await services.topic.search({
        q: searchTerm,
      });
      assert(count > 0);
      assert(data.length !== 0);
      assert(
        data.every((topic) => topic.id.toLowerCase().includes(searchTerm)),
      );
    });

    describe("Non-anonymous", () => {
      let testUserId: string;

      beforeEach(async () => {
        testUserId = await services.user.create(TEST_USER_1);
      });

      afterEach(async () => {
        await services.me.delete(testUserId);
      });

      test("Non-anonymous search (user that follows no topics)", async () => {
        const search = await services.topic.search({
          myUserId: testUserId,
        });

        assert(search.count > 0);
        assert(search.data.every((topic) => !topic.am_i_following));
      });

      test("Non-anonymous search (user that follows 2 topics)", async () => {
        const someTopics = await services.topic.search();

        const randomTopic1 = pickRandom(someTopics.data)
        // Follow 2 random topics
        await Promise.all([
          services.topic.follow(randomTopic1.id, testUserId),
          services.topic.follow(pickRandom(someTopics.data.filter(t => t.id !== randomTopic1.id)).id, testUserId),
        ]);

        const search = await services.topic.search({
          myUserId: testUserId,
        });

        assert(search.count > 0);
        assert(
          search.data.filter((topic) => topic.am_i_following).length === 2,
        );
      });
    });
  });

  describe("BY ID", () => {
    let targetTopic: ttopic.Topic;

    beforeEach(async () => {
      targetTopic = pickRandom((await services.topic.search()).data);
    });

    describe("Anonymous", () => {
      test("Existing topic", async () => {
        const result = await services.topic.byId(targetTopic.id);
        assert(result !== null);
        assert(result.id === targetTopic.id);
      });

      test("[FAIL] Non Existing topic", async () => {
        await assertThrows(services.topic.byId("JSKJlksdjf"), TopicNotFound);
      });
    });

    describe("Non-anonymous", () => {
      let testUserId: string;

      beforeEach(async () => {
        testUserId = await services.user.create(TEST_USER_1);
      });

      afterEach(async () => {
        await services.me.delete(testUserId);
      });

      test("Topic user does not follow", async () => {
        const topic = await services.topic.byId(targetTopic.id);

        assert(topic !== null);
        assert(topic.am_i_following === false);
      });

      test("Topic user follows", async () => {
        await services.topic.follow(targetTopic.id, testUserId);

        const topic = await services.topic.byId(targetTopic.id, testUserId);

        assert(topic !== null);
        assert(topic.am_i_following === true);
      });
    });
  });

  describe("UNFOLLOW", () => {
    let targetTopic: ttopic.Topic;
    let testUserId: string;

    beforeEach(async () => {
      [targetTopic, testUserId] = await Promise.all([
        services.topic.search().then((res) => pickRandom(res.data)),
        services.user.create(TEST_USER_1),
      ]);
    });

    afterEach(async () => {
      await services.me.delete(testUserId);
    });

    test("[FAIL] Not following", async () => {
      await assertThrows(
        services.topic.unfollow(targetTopic.id, testUserId),
        NotFollowingTopic,
      );
    });

    test("Is", async () => {
      await services.topic.follow(targetTopic.id, testUserId);

      const topicBeforeUnfollow = await services.topic.byId(
        targetTopic.id,
        testUserId,
      );
      assert(topicBeforeUnfollow?.am_i_following === true);

      await services.topic.unfollow(targetTopic.id, testUserId);

      const topicAfterUnfollow = await services.topic.byId(targetTopic.id);
      assert(topicAfterUnfollow?.am_i_following === false);
    });
  });
});
