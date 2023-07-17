import { difficulty } from "@prisma/client";
import { z } from "zod";
import { buildSchema, type Schema } from "$lib/utils/buildSchema";
import {
  usernameSchema,
  uuid,
} from "$lib/services/InputValidators/commonValidators";

export const PostStatsSchema: Schema<tpost.PostStats> = buildSchema(
  "Post with statistical information",
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    difficulty: z.nativeEnum(difficulty).nullable(),
    created_at: z.date(),
    author: z.object({
      id: uuid.schema,
      name: usernameSchema.schema,
      image: z.string().nullable(),
      created_at: z.date(),
    }),
    topics: z.string().array(),

    ranking_position: z.any().transform((i) => Number(i)) as z.ZodType<number>,
    avg_rating: z.any().transform((i) => Number(i)) as any as z.ZodType<number>,
    rates_count: z.any().transform((i) => Number(i)) as z.ZodType<number>,
    views_count: z.any().transform((i) => Number(i)) as z.ZodType<number>,
  }),
);

export const PostStatsMySchema: Schema<tpost.PostMyInfo> = buildSchema(
  "Post with statistical information",
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    difficulty: z.nativeEnum(difficulty).nullable(),
    created_at: z.date(),
    author: z.object({
      id: uuid.schema,
      name: usernameSchema.schema,
      image: z.string().nullable(),
      created_at: z.date(),
    }),
    topics: z.string().array(),

    ranking_position: z.any().transform((i) => Number(i)) as z.ZodType<number>,
    avg_rating: z.any().transform((i) => Number(i)) as any as z.ZodType<number>,
    rates_count: z.any().transform((i) => Number(i)) as z.ZodType<number>,
    views_count: z.any().transform((i) => Number(i)) as z.ZodType<number>,

    i_read: z.boolean().nullable(),
    i_saved: z.boolean().nullable(),
    i_rated: z.number().nullable(),
  }),
);
