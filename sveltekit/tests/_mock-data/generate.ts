import { generateMockUsers } from "./users/generateMockUsers";
import { generatePostsFromJoelBlog } from "./posts/generateMockPostsBlog";
import { generatePostsFromHackerNews } from "./posts/generateMockPostsHackerNews";
import { clearDataStorage, pickRandom, randomDate } from "../utils";
import { difficulty } from "@prisma/client";
import { v4 as generateUUID } from "uuid";
import { generateNtoNRelations } from "./generateRelations";
import { getImageForPost, getQuizForPost } from "./uploadBlobs";
import { blobStorage, prismaClient } from "$lib/index.server";
import { BLOBAllowedFileTypes } from "$lib/services/constraints";
import { generatePostsFromTechCrunch } from "./posts/generatePostsFromTechCrunch";

// * ENTRY POINT * \\
console.log("| -- Mock Data Generation Script -- |\n");

const topics: string[] = await prismaClient.topic
  .findMany()
  .then((topics) => topics.map((t) => t.id));
if (topics.length === 0) {
  throw Error(
    "Please initialize the databse first! No topics found in the database",
  );
}

const startCleanup = Date.now();

await Promise.all([blobStorage.clearAll(), clearDataStorage()]);

console.log(
  "Test data storage and blob storage cleared in ",
  Date.now() - startCleanup,
  "ms",
);

const startGenerate = Date.now();

await Promise.all([
  generatePostsFromTechCrunch(),
  generatePostsFromJoelBlog(),
  generatePostsFromHackerNews(),
  generateMockUsers(),
]).then(async ([techCrunchPosts, joelPosts, hackerNewsPosts, users]) => {
  console.log("Generated mock data in", Date.now() - startGenerate, "ms");

  const markdownPostPages = [
    ...techCrunchPosts,
    ...joelPosts,
    ...hackerNewsPosts,
  ].map((p) => ({
    ...p,
    id: generateUUID(),
  }));

  const posts = markdownPostPages.map((ipost) => ({
    id: ipost.id,
    author_id: pickRandom(users).id,
    created_at: randomDate(),
    difficulty: pickRandom([null, ...Object.values(difficulty)]),
    title: ipost.title,
    description: ipost.description.substring(0, 300),
  }));
  // ...generateRandomPostsMetadata(users, 450),

  console.log("Fetched", posts.length, "posts");

  const startStore = Date.now();

  const feeds = Array(100).fill(null).map(() => {
    const user = pickRandom(users);

    return {
      id: generateUUID(),
      name: "A custom feed",
      owner_id: user.id,
    };
  });

  // * Store Users (needs to run before creating posts)
  await prismaClient.user.createMany({ data: users });
  // * Store Posts Metadata
  await prismaClient.post.createMany({ data: posts });
  // * Store Feed Metadata
  await prismaClient.feed.createMany({ data: feeds });

  // * Store N to N relations between POSTS, USERS and TOPICS
  await generateNtoNRelations(
    topics,
    users,
    posts,
    feeds.map((f) => f.id),
  );

  await Promise.all(
    // * Store Posts Pages
    posts.map(async (post) => {
      const pages: Blob[] = [];

      const markdownPage = markdownPostPages.find((p) => p.id === post.id);
      if (markdownPage) {
        const blob = new Blob([markdownPage.content], {
          type: BLOBAllowedFileTypes.MARKDOWN.type,
        });
        pages.push(blob);
      }

      const randomImage = await getImageForPost();
      if (randomImage) {
        pages.push(randomImage);
      }
      const randomQuiz = await getQuizForPost();
      if (randomQuiz) {
        pages.push(randomQuiz);
      }

      return blobStorage.uploadPostPages(post.id, pages);
    }),
  );

  console.log("Stored mock data in", Date.now() - startStore, "ms");
});

console.log(
  "\n\n[DONE]\n",
  "- Posts Metadata and Users written to diskstorage\n",
  "- Post Markdown Pages written to blob storage\n",
  "- Post Quiz and Image Pages written to blob storage",
);

process.exit(0);
