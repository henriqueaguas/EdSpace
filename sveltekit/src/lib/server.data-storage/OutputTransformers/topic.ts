import { buildSchema, type Schema } from "$lib/utils/buildSchema";
import { z } from "zod";

export const TopicStatsSchema: Schema<ttopic.TopicStats> = buildSchema(
  "Topic Stats",
  z.object({
    id: z.string(),
    posts_count: z.any().transform((i) => Number(i)) as any as z.ZodType<
      number
    >,
    followers_count: z.any().transform((i) => Number(i)) as any as z.ZodType<
      number
    >,
  }),
);

export const TopicStatsMySchema: Schema<ttopic.TopicStatsMy> = buildSchema(
  "Topic Stats",
  z.object({
    id: z.string(),
    posts_count: z.any().transform((i) => Number(i)) as any as z.ZodType<
      number
    >,
    followers_count: z.any().transform((i) => Number(i)) as any as z.ZodType<
      number
    >,

    am_i_following: z.boolean(),
  }),
);
