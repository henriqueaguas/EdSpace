import { prismaClient } from "$lib/index.server";
import jetpack from "fs-jetpack";
import { getBlobFromFile } from "./blob-storage/utils";
import { pickRandom } from "./utils";

export const TEST_USER_1: svct.inputs.user.Create = {
  name: "TestUser1",
  email: "test1@test.com",
};

export const TEST_USER_2: svct.inputs.user.Create = {
  name: "TestUser2",
  email: "test2@test.com",
};

export const TEST_USER_3: svct.inputs.user.Create = {
  name: "TestUser3",
  email: "test3@test.com",
};

export const testPostPages = jetpack.cwd("tests/blob-storage/mock-post-pages");
export const testInvalidPostPages = jetpack.cwd(
  "tests/blob-storage/mock-post-pages-invalid",
);

export const invalidPostPage = await getBlobFromFile(
  testInvalidPostPages,
  "invalidfile.docx",
);
export const validTitle = "REST vs GraphQL vs gRPC";
export const validDescription =
  "REST, GraphQL, and gRPC are the 3 most popular API development technologies in modern web applications. However, choosing one isn't easy since they all have unique features.";
export const validDifficulty: tpost.Difficulty = "medium";
export const validTopics: string[] = await prismaClient.topic.findMany().then(
  (topics) => {
    const choosenTopics: string[] = [];
    const allTopics = topics.map((t) => t.id);
    for (let i = 0; i < 5; i++) {
      let newTopic = pickRandom(allTopics);
      while (choosenTopics.includes(newTopic)) {
        newTopic = pickRandom(allTopics);
      }
      choosenTopics.push(newTopic);
    }
    return choosenTopics;
  },
);
export const validCreatePostData = {
  title: validTitle,
  description: validDescription,
  difficulty: validDifficulty,
  topics: validTopics,
};
