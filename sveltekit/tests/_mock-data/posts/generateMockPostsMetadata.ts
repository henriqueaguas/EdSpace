import { v4 as generateUUID } from "uuid";
import { pickRandom, randomDate } from "../../utils";
import { difficulty, type post, type user } from "@prisma/client";

export const generateRandomPostsMetadata = (
  availableUserIds: user[],
  count: number,
): post[] =>
  Array.from({ length: count }).map((_) => ({
    id: generateUUID(),
    author_id: pickRandom(availableUserIds).id,
    created_at: randomDate(),
    difficulty: pickRandom(Object.values(difficulty)),
    title:
      "Tempor est tempor amet excepteur nulla ex duis sunt sit laborum enim.",
    description:
      "in ipsum dolor tempor cillum magna aliquip ullamco excepteur officia ad reprehenderit incididunt reprehenderit laborum eu cupidatat aliqua minim aliquip non exercitation adipisicing ad dolor ut in consequat voluptate mollit excepteur adipisicing aliquip anim sit laboris aliquip exercitation",
  }));
