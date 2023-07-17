import type {
  feed_author,
  feed_topic,
  post,
  post_rating,
  post_topic,
  post_view,
  saved_post,
  topic_follow,
  user,
  user_follow,
} from "@prisma/client";
import { pickRandom, runInDB, shuffleArray } from "../utils";
import { prismaClient } from "$lib/index.server";

export async function generateNtoNRelations(
  availableTopics: string[],
  availableUsers: user[],
  availablePosts: post[],
  availableFeeds: string[],
) {
  const topicFollows: topic_follow[] = [];
  const postTopics: post_topic[] = [];
  const postViews: post_view[] = [];
  const postsSaved: saved_post[] = [];
  const userFollows: user_follow[] = [];
  const postRatings: post_rating[] = [];
  const feedAuthors: feed_author[] = [];
  const feedTopics: feed_topic[] = [];

  availableUsers.forEach((u1) => {
    // User Follows
    for (const u2 of availableUsers) {
      if (u1.id === u2.id) {
        continue;
      }

      const shouldFollow = pickRandom([false, false, false, true]);
      if (shouldFollow) {
        // User1 will follow User2
        userFollows.push({
          user_id: u2.id,
          follower_id: u1.id,
        });
      }
    }

    // User saved posts, post ratings and views
    for (const post of availablePosts) {
      if (post.author_id === u1.id) {
        continue;
      }
      const shouldView = pickRandom([false, false, false, true]);
      const shouldSave = pickRandom([false, false, false, true]);
      const rating = pickRandom([
        null,
        null,
        null,
        null,
        null,
        1,
        2,
        3,
        3,
        4,
        4,
        4,
        4,
        5,
        5,
        5,
      ]);
      if (shouldView) {
        postViews.push({
          user_id: u1.id,
          post_id: post.id,
        });
      }
      if (shouldSave) {
        postsSaved.push({
          user_id: u1.id,
          post_id: post.id,
        });
      }
      if (rating) {
        postRatings.push({
          user_id: u1.id,
          post_id: post.id,
          rating: rating,
        });
      }
    }

    // User follow topics
    for (const topicId of availableTopics) {
      const shouldFollow = pickRandom([false, false, true]);
      if (shouldFollow) {
        topicFollows.push({
          topic_id: topicId,
          follower_id: u1.id,
        });
      }
    }
  });

  availablePosts.forEach((post) => {
    let iterations = 0;
    let topicsAcquired = 0;

    // Attribute topics to a post
    for (const topicId of shuffleArray(availableTopics)) {
      if (iterations >= 5 && topicsAcquired >= 2) {
        break;
      }
      const shouldHaveTopic = pickRandom([false, true]);

      if (shouldHaveTopic) {
        postTopics.push({
          post_id: post.id,
          topic_id: topicId,
        });
        topicsAcquired++;
      }

      iterations++;
    }
  });

  availableFeeds.forEach((feedId) => {
    const topicsAcquired: string[] = [];

    // Pick 10 random topics
    for (let i = 0; i < pickRandom([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); i++) {
      let newTopic;
      while (true) {
        newTopic = pickRandom(availableTopics);
        if (topicsAcquired.includes(newTopic)) {
          continue;
        }
        topicsAcquired.push(newTopic);
        feedTopics.push({
          feed_id: feedId,
          topic_id: newTopic,
        });
        break;
      }
    }

    const authorsAcquired: string[] = [];

    // Pick 10 random authors
    for (let i = 0; i < pickRandom([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); i++) {
      let newAuthor;
      while (true) {
        newAuthor = pickRandom(availableUsers.map((u) => u.id));
        if (authorsAcquired.includes(newAuthor)) {
          continue;
        }
        authorsAcquired.push(newAuthor);
        feedAuthors.push({
          feed_id: feedId,
          author_id: newAuthor,
        });
        break;
      }
    }
  });

  // Doing it in parallel makes it run out of memory
  await runInDB(() =>
    prismaClient.topic_follow.createMany({
      data: topicFollows,
    })
  );
  await runInDB(() =>
    prismaClient.post_topic.createMany({
      data: postTopics,
    })
  );
  await runInDB(() =>
    prismaClient.post_view.createMany({
      data: postViews,
    })
  );
  await runInDB(() =>
    prismaClient.saved_post.createMany({
      data: postsSaved,
    })
  );
  await runInDB(() =>
    prismaClient.user_follow.createMany({
      data: userFollows,
    })
  );
  await runInDB(() =>
    prismaClient.post_rating.createMany({
      data: postRatings,
    })
  );
  await runInDB(() =>
    prismaClient.feed_author.createMany({
      data: feedAuthors,
    })
  );
  await runInDB(() =>
    prismaClient.feed_topic.createMany({
      data: feedTopics,
    })
  );
}
