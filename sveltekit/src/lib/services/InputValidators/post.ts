import { difficulty } from "@prisma/client";
import { z } from "zod";
import {
  postDescriptionSchema,
  postTitleSchema,
  topicsSchema,
} from "./commonValidators";
import { buildSchema, type Schema } from "$lib/utils/buildSchema";

export const CreatePostInputSchema: Schema<svct.inputs.post.Create> =
  buildSchema(
    "Post Input Data",
    z.object({
      title: postTitleSchema.schema,
      description: postDescriptionSchema.schema,
      difficulty: z.nativeEnum(difficulty).nullable(),
      topics: topicsSchema.schema,
    }),
  );

export const PossibleDatesSchema = buildSchema(
  "Possible Date",
  z.enum(
    [
      "week",
      "year",
      "yesterday",
    ] satisfies svct.inputs.post.PossibleDates[] as any,
  ),
);
