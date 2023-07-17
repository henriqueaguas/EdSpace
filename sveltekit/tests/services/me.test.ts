import { PostNotFound, UserNotFound, UserUpdateImageConstraint, UserUpdateNameConstraint } from "$lib/_errors/LogicError";
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
import { TEST_USER_1, TEST_USER_2, testPostPages, validCreatePostData } from "../objects";
import { assertDoesNotThrow, assertThrows } from "../assertionFunctions";
import { v4 as generateUUID } from "uuid"
import jetpack from "fs-jetpack";
import { getBlobFromFile } from "../blob-storage/utils";

const testImageBLOB = await getBlobFromFile(
    jetpack.cwd("tests/blob-storage/mock-profile-pictures"),
    "image.jpeg",
);

describe("[SERVICE] - Me", async () => {
    let testUserId: tuser.UserPrivateStats["id"];

    beforeEach(async () => {
        testUserId = await services.user.create(TEST_USER_1);
    })

    afterEach(async () => {
        await prismaClient.user.deleteMany();
    })

    describe("GET", () => {
        test("Success", async () => {
            await assertDoesNotThrow(services.me.get(testUserId))
        })

        test("[FAIL] - User does not exist", async () => {
            await assertThrows(
                services.me.get(generateUUID()),
                UserNotFound
            )
        })
    })

    describe("DELETE", () => {
        test("Success", async () => {
            await assertDoesNotThrow(services.me.delete(testUserId))
            await assertThrows(services.me.get(testUserId), UserNotFound)
        })

        test("[FAIL] - User does not exist", async () => {
            await assertThrows(
                services.me.delete(generateUUID()),
                UserNotFound
            )
        })
    })

    describe("SIGN-UP PROCESS", () => {
        test("Success", async () => {
            assert(!(await services.me.hasCompletedSignUp(testUserId)))
            await services.me.completeSignUp(testUserId)
            assert(await services.me.hasCompletedSignUp(testUserId))
        })

        test("[FAIL] - hasCompletedSignUp - User does not exist", async () => {
            await assertThrows(
                services.me.hasCompletedSignUp(generateUUID()),
                UserNotFound
            )
        })

        test("[FAIL] - completeSignUp - User does not exist", async () => {
            await assertThrows(
                services.me.completeSignUp(generateUUID()),
                UserNotFound
            )
        })
    })

    describe("UPDATE", () => {
        test("Success - update user name", async () => {
            const before = await services.me.get(testUserId)

            await services.me.update(testUserId, undefined, TEST_USER_2.name)

            const after = await services.me.get(testUserId)

            assert(after.name !== before.name)
            assert(after.name === TEST_USER_2.name)
            assert(before.image === after.image)
        })

        test("Success - update image", async () => {
            const before = await services.me.get(testUserId)

            await services.me.update(testUserId, testImageBLOB, undefined)
            const after = await services.me.get(testUserId)

            assert(before.image === null)

            assert(after.image !== null)
            assert(before.name === after.name)
        })

        test("Success - update name + image", async () => {
            const before = await services.me.get(testUserId)

            await services.me.update(testUserId, testImageBLOB, TEST_USER_2.name)
            const after = await services.me.get(testUserId)

            // Names changed?
            assert(before.name !== after.name)
            assert(after.name === TEST_USER_2.name)

            // Image changed?
            assert(before.image === null)
            assert(after.image !== null)
            assert(before.name !== after.name)
        })

        test("[FAIL] - update name with an unallowed frequency", async () => {
            await services.me.update(testUserId, undefined, TEST_USER_2.name)

            await assertThrows(
                services.me.update(testUserId, undefined, TEST_USER_1.name),
                UserUpdateNameConstraint
            )
        })

        test("[FAIL] - update image with an unallowed frequency", async () => {
            await services.me.update(testUserId, testImageBLOB, undefined)

            await assertThrows(
                services.me.update(testUserId, testImageBLOB, undefined),
                UserUpdateImageConstraint
            )
        })
    })

    describe("SAVED POSTS", () => {
        const createTestPost = async (): Promise<string> => {
            return services.post.create(
                testUserId,
                validCreatePostData,
                await Promise.all(
                    testPostPages.list()!.map(async (name) =>
                        getBlobFromFile(testPostPages, name)
                    ),
                ))
        }

        test("Success - no posts saved", async () => {
            const result = await services.me.savedPosts(testUserId)
            assert(result.count === 0)
        })

        test("Success - Add to saved posts", async () => {
            const testPostId = await createTestPost()

            await services.me.addToSavedPosts(testUserId, testPostId)

            const result = await services.me.savedPosts(testUserId)

            assert(result.count === 1)
            assert(result.data[0].id === testPostId)
        })

        test("Success - Delete from saved posts", async () => {
            const testPostId = await createTestPost()

            await assertDoesNotThrow(
                services.me.addToSavedPosts(testUserId, testPostId)
            )
            await assertDoesNotThrow(
                services.me.deleteFromSavedPosts(testUserId, testPostId)
            )

            const getAfter = await services.me.savedPosts(testUserId)

            assert(getAfter.count === 0)
        })

        test("[FAIL] - Post does not exist", async () => {
            await assertThrows(
                services.me.addToSavedPosts(testUserId, generateUUID()),
                PostNotFound
            )
        });
    })
})