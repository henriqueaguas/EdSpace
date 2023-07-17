import { z } from "zod";
import { buildSchema, type Schema } from "../../utils/buildSchema";
import {
  usernameSchema,
  uuid,
} from "$lib/services/InputValidators/commonValidators";

export const UserPublicStatsSchema: Schema<tuser.UserPublicStats> = buildSchema(
  "User Public Information",
  z.object(
    {
      id: uuid.schema,
      name: usernameSchema.schema,
      image: z.string().nullable(),
      created_at: z.date(),

      avg_post_rating: z.any().transform((i) => Number(i)) as any as z.ZodType<
        number
      >,
      followers_count: z.any().transform((i) => Number(i)) as any as z.ZodType<
        number
      >,
      ranking_position: z.any().transform((i) => i ? Number(i) : null) as any as z.ZodType<
        number | null
      >,
      posts_published: z.any().transform((i) => Number(i)) as any as z.ZodType<
        number
      >,

      topics_user_publishes_on: z.string().array(),

      score: z.number(),
    },
  ),
);

export const UserPublicStatsMySchema: Schema<tuser.UserPublicStatsMy> =
  buildSchema(
    "User Public Information",
    z.object(
      {
        id: uuid.schema,
        name: usernameSchema.schema,
        image: z.string().nullable(),
        created_at: z.date(),

        avg_post_rating: z.any().transform((i) =>
          Number(i)
        ) as any as z.ZodType<
          number
        >,
        followers_count: z.any().transform((i) =>
          Number(i)
        ) as any as z.ZodType<
          number
        >,
        ranking_position: z.any().transform((i) =>
          i ? Number(i) : null
        ) as any as z.ZodType<
          number | null
        >,
        posts_published: z.any().transform((i) =>
          Number(i)
        ) as any as z.ZodType<
          number
        >,

        topics_user_publishes_on: z.string().array(),

        am_i_following: z.boolean().nullable(),

        score: z.number(),
      },
    ),
  );

export const UserPrivateStatsSchema: Schema<tuser.UserPrivateStats> =
  buildSchema(
    "User Private Information",
    z.object(
      {
        id: uuid.schema,
        name: usernameSchema.schema,
        image: z.string().nullable(),
        created_at: z.date(),
        email: z.string(),
        emailVerified: z.date().nullable(),
        name_updated_at: z.date().nullable(),
        image_updated_at: z.date().nullable(),
        signupComplete: z.boolean(),

        avg_post_rating: z.any().transform((i) =>
          Number(i)
        ) as any as z.ZodType<
          number
        >,
        followers_count: z.any().transform((i) =>
          Number(i)
        ) as any as z.ZodType<
          number
        >,
        ranking_position: z.any().transform((i) =>
          i ? Number(i) : null
        ) as any as z.ZodType<
          number | null
        >,
        posts_published: z.any().transform((i) =>
          Number(i)
        ) as any as z.ZodType<
          number
        >,

        topics_user_publishes_on: z.string().array(),

        score: z.number(),
      },
    ),
  );
