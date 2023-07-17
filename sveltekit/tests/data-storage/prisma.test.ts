import { afterEach, assert, beforeAll, describe, test } from "vitest";
import { TEST_USER_1 } from "../objects";
import { dataStorage, prismaClient } from "$lib/index.server";

describe("Users", () => {
  beforeAll(async () => {
    // Make sure the database is online
    await prismaClient.$connect();

    // Removes users and sessions
    await Promise.all([
      prismaClient.user.deleteMany(),
      prismaClient.session.deleteMany(),
    ]);
  });

  afterEach(async () => {
    // Removes users and sessions
    await Promise.all([
      prismaClient.user.deleteMany(),
      prismaClient.session.deleteMany(),
    ]);
  });

  test("Create user and session", async () => {
    const newUserId = await dataStorage.user.create(TEST_USER_1);
    const session = await dataStorage.auth.createSession(newUserId);

    assert(
      prismaClient.user.findUnique({
        where: {
          email: TEST_USER_1.email,
        },
      }) !== null,
    );

    assert(
      prismaClient.session.findUnique({
        where: {
          id: session.id,
        },
      }) !== null,
    );
  });
});
