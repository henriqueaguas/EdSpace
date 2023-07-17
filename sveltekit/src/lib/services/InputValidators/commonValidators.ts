import { z } from "zod";
import { buildSchema } from "../../utils/buildSchema";
import { LogicConstraints } from "../constraints";

export const emailSchema = buildSchema("Email", z.string().email());
export const usernameSchema = buildSchema(
  "Username",
  z
    .string()
    .min(LogicConstraints.User.USERNAME.min_chars)
    .max(LogicConstraints.User.USERNAME.max_chars),
);
export const uuid = buildSchema("UUID", z.string().uuid());
export const topicNameSchema = buildSchema(
  "Topic Name",
  z.string()
    .min(
      LogicConstraints.Topics.NAME.min_chars,
      `Topic name must have at least ${LogicConstraints.Topics.NAME.min_chars} characters`,
    )
    .max(
      LogicConstraints.Topics.NAME.max_chars,
      `Topic name must have at maximum ${LogicConstraints.Topics.NAME.max_chars} characters`,
    ),
);
export const topicNamesSchema = buildSchema(
  "Topic Names",
  topicNameSchema.schema.array()
)
export const topicsSchema = buildSchema(
  "Topics",
  topicNameSchema.schema
    .array()
    .min(
      LogicConstraints.Posts.MIN_POST_TOPICS,
      `You need to pass at least ${LogicConstraints.Posts.MIN_POST_TOPICS} topics`,
    )
    .max(
      LogicConstraints.Posts.MAX_POST_TOPICS,
      `You can't exceed ${LogicConstraints.Posts.MIN_POST_TOPICS} topics for a post`,
    ),
);
export const ratingSchema = buildSchema(
  "Post Rating",
  z.number().min(LogicConstraints.Posts.RATING.min).max(
    LogicConstraints.Posts.RATING.max,
  ),
);
export const searchQuerySchema = buildSchema(
  "Search Query",
  z
    .string()
    .min(
      LogicConstraints.Searches.min_chars,
      `Search query is to short. Minimum of ${LogicConstraints.Searches.min_chars} characters`,
    )
    .max(
      LogicConstraints.Searches.max_chars,
      `Search query is to long. Maximum of ${LogicConstraints.Searches.max_chars} characters`,
    ),
);
export const postTitleSchema = buildSchema(
  "Post Title",
  z
    .string()
    .min(LogicConstraints.Posts.TITLE_LENGTH.min_chars)
    .max(LogicConstraints.Posts.TITLE_LENGTH.max_chars),
);
export const postDescriptionSchema = buildSchema(
  "Post Description",
  z
    .string()
    .min(LogicConstraints.Posts.DESCRIPTION_LENGTH.min_chars)
    .max(LogicConstraints.Posts.DESCRIPTION_LENGTH.max_chars)
    .nullable(),
);
export const feedNameSchema = buildSchema(
  "Feed Name",
  z.string()
    .min(
      LogicConstraints.Feed.NAME.min_chars,
      `Feed name must have at least ${LogicConstraints.Feed.NAME.min_chars} characters`,
    )
    .max(
      LogicConstraints.Feed.NAME.max_chars,
      `Feed name must have at maximum ${LogicConstraints.Feed.NAME.max_chars} characters`,
    ),
);
export const feedAuthors = buildSchema(
  "Feed Authors",
  z.string().uuid().array()
    .max(
      LogicConstraints.Feed.MAX_AUTHORS,
      `A single feed can have, at maximum ${LogicConstraints.Feed.MAX_AUTHORS} authors associated with it`,
    ),
);
export const feedTopics = buildSchema(
  "Feed Topics",
  topicNameSchema.schema.array()
    .max(
      LogicConstraints.Feed.MAX_TOPICS,
      `A single feed can have, at maximum ${LogicConstraints.Feed.MAX_TOPICS} topics associated with it`,
    ),
);

export const profilePictureSchema = buildSchema(
  "Profile Picture",
  z
    .string()
    .max(
      LogicConstraints.Searches.max_chars,
      `Image size is to long. Maximum of ${LogicConstraints.User.PROFILE_PICTURE.MAX_IMAGE_SIZE_MB} MB`,
    ),
);
