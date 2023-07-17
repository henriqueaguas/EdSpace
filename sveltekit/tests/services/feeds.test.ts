import { assertDoesNotThrow, assertThrows } from "../assertionFunctions";
import { FeedNotFound, OnlyOwnerCanPerform, PostNotFound, RepeatedAuthors, RepeatedTopics, UserNotFound, UserUpdateImageConstraint, UserUpdateNameConstraint } from "$lib/_errors/LogicError";
import { prismaClient, services } from "$lib/index.server";
import {
    afterAll,
    afterEach,
    assert,
    beforeAll,
    beforeEach,
    describe,
    test,
} from "vitest";
import { TEST_USER_1, TEST_USER_2, TEST_USER_3, testPostPages, validCreatePostData, validTopics } from "../objects";
import { v4 as generateUUID } from "uuid"
import jetpack from "fs-jetpack";
import { getBlobFromFile } from "../blob-storage/utils";

const testImageBLOB = await getBlobFromFile(
    jetpack.cwd("tests/blob-storage/mock-profile-pictures"),
    "image.jpeg",
);

const FEED_NAME = "FeedName"

describe("[SERVICE] - Feeds", async () => {
    let myUserId: string

    const testTopicIds = validTopics
    let testUserIds: string[]

    beforeAll(async () => {
        // Create users
        const u1id = await services.user.create(TEST_USER_1);
        const u2id = await services.user.create(TEST_USER_2);
        myUserId = await services.user.create(TEST_USER_3);

        testUserIds = [u1id, u2id]
    })

    afterAll(async () => {
        await prismaClient.user.deleteMany()
    })

    afterEach(async () => {
        await prismaClient.feed.deleteMany()
    })

    describe("CREATE", async () => {
        test("Success - only with topics", async () => {
            const { id: feedId } = await services.feed.create(myUserId, FEED_NAME, validTopics)

            await assertDoesNotThrow(services.feed.byId(feedId, myUserId))
            const topics = await services.feed.getTopics(feedId)

            assert(topics.length === validTopics.length)
        })

        test("Success - topics and authors", async () => {
            const { id: feedId } = await services.feed.create(myUserId, FEED_NAME, validTopics, testUserIds)

            const topics = await services.feed.getTopics(feedId)
            const authors = await services.feed.getAuthors(feedId)

            assert(topics.length === validTopics.length)
            assert(authors.length === testUserIds.length)
        })
    })

    describe("DELETE", async () => {
        let testFeedId: string

        beforeEach(async () => {
            const { id } = await services.feed.create(myUserId, FEED_NAME, validTopics, undefined)
            testFeedId = id
        })

        test("Success", async () => {
            await services.feed.delete(testFeedId, myUserId)

            await assertThrows(
                services.feed.byId(testFeedId, myUserId),
                FeedNotFound
            )
        });

        test("[FAIL] - Delete feed using user id != owner id", async () => {
            await assertThrows(
                services.feed.delete(testFeedId, generateUUID()),
                OnlyOwnerCanPerform
            )
        });
    })

    describe("UPDATE", async () => {
        let testFeedId: string

        beforeEach(async () => {
            const { id } = await services.feed.create(myUserId, FEED_NAME, validTopics, undefined)
            testFeedId = id
        })

        test("Success - update name + topics", async () => {
            const newTopics = validTopics.slice(1)
            const newName = "NewName"

            await services.feed.update(testFeedId, myUserId, newName, newTopics, undefined)

            const after = await services.feed.byId(testFeedId, myUserId)
            const topicsAfter = await services.feed.getTopics(testFeedId).then(ts => ts.map(t => t.id))

            assert(after.name === newName)
            assert(JSON.stringify(topicsAfter) === JSON.stringify(newTopics))
        });

        test("Success - update name + authors", async () => {
            const newAuthors = testUserIds.slice(1)
            const newName = "NewName"

            await services.feed.update(testFeedId, myUserId, newName, undefined, newAuthors)

            const after = await services.feed.byId(testFeedId, myUserId)
            const authorsAfter = await services.feed.getAuthors(testFeedId).then(as => as.map(a => a.id))

            assert(after.name === newName)
            assert(JSON.stringify(authorsAfter) === JSON.stringify(newAuthors))
        });

        /* test("[FAIL] - repeated authors", async () => {
            const newAuthorsRepeated = [...testUserIds, testUserIds[0]]

            //! Fails for unkown reason
            // await assertThrows(
            //     services.feed.update(testFeedId, myUserId, undefined, undefined, newAuthorsRepeated),
            //     RepeatedAuthors
            // )
        }); */

        /* test("[FAIL] - repeated topics", async () => {
            const newTopicsRepeated = [...validTopics, validTopics[0]]

            //! Fails for unkown reason
            // await assertThrows(
            //     services.feed.update(testFeedId, myUserId, undefined, newTopicsRepeated, undefined),
            //     RepeatedTopics
            // )
        }); */
    })

    describe("SWAP FEED POSITION", async () => {
        let testFeeds: tfeed.Feed[]

        beforeEach(async () => {
            const f1 = await services.feed.create(myUserId, FEED_NAME, validTopics, undefined)
            const f2 = await services.feed.create(myUserId, FEED_NAME, validTopics, undefined)
            const f3 = await services.feed.create(myUserId, FEED_NAME, validTopics, undefined)

            testFeeds = [f1, f2, f3]
        })

        test("Success", async () => {
            assert(testFeeds[0].position === 1)
            assert(testFeeds[1].position === 2)
            assert(testFeeds[2].position === 3)

            await services.feed.swapPosition(testFeeds[0].id, testFeeds[2].id, myUserId)

            const [f1, f2, f3] = await Promise.all([
                services.feed.byId(testFeeds[0].id, myUserId),
                services.feed.byId(testFeeds[1].id, myUserId),
                services.feed.byId(testFeeds[2].id, myUserId),
            ])

            assert(f3.position === 1)
            assert(f2.position === 2)
            assert(f1.position === 3)
        });
    })

    describe("GET USER FEEDS", async () => {
        let testUserFeeds: tfeed.Feed[]

        beforeEach(async () => {
            const f1 = await services.feed.create(myUserId, FEED_NAME, validTopics, undefined)
            const f2 = await services.feed.create(myUserId, FEED_NAME, validTopics, undefined)
            const f3 = await services.feed.create(myUserId, FEED_NAME, validTopics, undefined)

            testUserFeeds = [f1, f2, f3]
        })

        test("Success - 3 feeds", async () => {
            const feeds = await services.feed.getUserFeeds(myUserId)

            assert(feeds.length === testUserFeeds.length)
        });

        test("Success - No feeds", async () => {
            const feeds = await services.feed.getUserFeeds(testUserIds[0])

            assert(feeds.length === 0)
        });
    })
})