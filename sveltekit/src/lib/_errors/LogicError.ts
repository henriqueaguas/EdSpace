import { LogicConstraints } from "../services/constraints";
import { AppError, ErrorCategory } from "./AppError";

const name = "Logic Error";

export class LogicError extends AppError {
  constructor(category: ErrorCategory, message: string) {
    super(category, name, message);
  }
}

// Users

export const UserNotFound = new LogicError(
  ErrorCategory.Not_Found,
  "User does not exist",
);

export const UsernameAlreadyTaken = new LogicError(
  ErrorCategory.Conflict,
  "A user with that username already exists",
);

export const UsersNotFound = (users: string[]) =>
  new LogicError(
    ErrorCategory.Not_Found,
    `Some Users do not exist: ${users.join(", ")}`,
  );
export const UserAlreadyExists = new LogicError(
  ErrorCategory.Conflict,
  "User already exists",
);
export const AlreadyFollowingUser = new LogicError(
  ErrorCategory.Conflict,
  "Already following that user",
);
export const NotFollowingUser = new LogicError(
  ErrorCategory.Not_Found,
  "Not following that user",
);
export const CannotFollowSelf = new LogicError(
  ErrorCategory.Conflict,
  "You can't follow yourself",
);

export const UserUpdateNameConstraint = new LogicError(
  ErrorCategory.Invalid_Data,
  `Can only update name every ${LogicConstraints.User.UPDATE_NAME_TIME_MS / (24 * 60 * 60 * 1000)} days`,
);

export const UserUpdateImageConstraint = new LogicError(
  ErrorCategory.Invalid_Data,
  `Can only update profile picture every  ${LogicConstraints.User.UPDATE_IMAGE_TIME_MS / (24 * 60 * 60 * 1000)} days`,
);

export const LargeImageSize = new LogicError(
  ErrorCategory.Invalid_Data,
  `Image size is too large. Max is ${LogicConstraints.User.PROFILE_PICTURE.MAX_IMAGE_SIZE_MB} MB`,
);

export const PostsNotFound = new LogicError(
  ErrorCategory.Not_Found,
  "You dont have posts",
);

// Topics

export const TopicNotFound = new LogicError(
  ErrorCategory.Not_Found,
  "Topic does not exist",
);

export const AlreadyFollowingTopics = new LogicError(
  ErrorCategory.Conflict,
  "Already following that topic",
);

export const NotFollowingTopic = new LogicError(
  ErrorCategory.Not_Found,
  "User is not following that topic",
);

export const TopicsNotFound = (topics: string[]) =>
  new LogicError(
    ErrorCategory.Not_Found,
    `Some of the topics do not exist: ${topics.join(", ")}`,
  );

// Posts

export const PostPagesConstraint = new LogicError(
  ErrorCategory.Invalid_Data,
  `Posts should have at least one and at max ${LogicConstraints.Posts.MAX_POST_PAGES} pages`,
);

export const PostNotFound = new LogicError(
  ErrorCategory.Not_Found,
  "Post not found",
);

export const PostPagesNotFound = new LogicError(
  ErrorCategory.Not_Found,
  "Post pages not found for that post",
);

export const OnlyOwnerCanPerform = new LogicError(
  ErrorCategory.Forbidden,
  "Only the owner can perform that action",
);

export const PostAlreadyViewed = new LogicError(
  ErrorCategory.Conflict,
  "User has already viewed the post",
);

export const RepeatedTopics = new LogicError(
  ErrorCategory.Invalid_Data,
  "Can't have repeated topics",
);

export const RepeatedAuthors = new LogicError(
  ErrorCategory.Invalid_Data,
  "Can't have repeated authors",
);

export const CannotRateOwnPost = new LogicError(
  ErrorCategory.Conflict,
  "You can't rate your own posts",
);

// Feed

export const FeedNotFound = new LogicError(
  ErrorCategory.Not_Found,
  "Feed not found",
);

export const NotYourFeed = new LogicError(
  ErrorCategory.Forbidden,
  "You can only view and edit your own feeds",
);

export const FeedTopicsAndAuthors = new LogicError(
  ErrorCategory.Invalid_Data,
  `A Feed needs at least ${LogicConstraints.Feed.MIN_TOPICS} topics or ${LogicConstraints.Feed.MIN_AUTHORS} authors and at max ${LogicConstraints.Feed.MAX_AUTHORS} authors and ${LogicConstraints.Feed.MAX_TOPICS} topics`,
);

export const FeedRepeatedTopics = new LogicError(
  ErrorCategory.Invalid_Data,
  `A feed cannot have repeated topics`,
);

export const FeedRepeatedAuthors = new LogicError(
  ErrorCategory.Invalid_Data,
  `A feed cannot have repeated authors`,
);

// BLOBs

export const ExceededMaxFileSize = (fileSize: number) =>
  new LogicError(
    ErrorCategory.Invalid_Data,
    `Your file is ${fileSize} MB. The maximum file size allowed is ${LogicConstraints.Posts.MAX_FILE_SIZE / 1024 / 1024
    } MB!`,
  );

export const InvalidFileType = new LogicError(
  ErrorCategory.Invalid_Data,
  `File type not allowed. Allowed file types: ${LogicConstraints.Posts.ALLOWED_FILE_TYPES_LIST.join(
    ", ",
  )
  }`,
);
