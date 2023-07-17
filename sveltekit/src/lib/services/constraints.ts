export const BLOBAllowedFileTypes = {
  PDF: { type: "application/pdf", ext: "pdf" },
  QUIZ: { type: "application/json+quiz", ext: "quiz.json" },
  MARKDOWN: { type: "text/markdown", ext: "md" },
  JPEG: { type: "image/jpeg", ext: "jpeg" },
  PNG: { type: "image/png", ext: "png" },
  JPG: { type: "image/jpg", ext: "jpg" },
  GIF: { type: "image/gif", ext: "gif" },
};

export const LogicConstraints = {
  Searches: {
    min_chars: 1,
    max_chars: 35,
  },
  Posts: {
    POSSIBLE_DIFFICULTIES: [
      null,
      "easy",
      "medium",
      "advanced",
    ] satisfies tpost.Difficulty[],
    TITLE_LENGTH: {
      min_chars: 8,
      max_chars: 120,
    },
    DESCRIPTION_LENGTH: {
      min_chars: 25,
      max_chars: 300,
    },
    QUIZ: {
      MIN_TEXT: 2,
      MAX_TEXT: 50,
      MIN_QUESTIONS: 1,
      MAX_QUESTIONS: 10,
      MIN_ANSWERS: 2,
      MAX_ANSWERS: 6,
    },
    MIN_POST_TOPICS: 2,
    MAX_POST_TOPICS: 5,
    MAX_POST_PAGES: 6,
    ALLOWED_FILE_TYPES: BLOBAllowedFileTypes,
    ALLOWED_FILE_TYPES_LIST: Object.values(BLOBAllowedFileTypes).map((i) =>
      i.type
    ),
    ALLOWED_FILE_EXTENSIONS_LIST: Object.values(BLOBAllowedFileTypes).map((i) =>
      `.${i.ext}`
    ),

    FILE_TYPE_TO_EXTENSION: (type: string) =>
      Object.values(BLOBAllowedFileTypes).find((i) => i.type === type)?.ext,

    EXTENSION_TO_FILE_TYPE: (ext: string) =>
      Object.values(BLOBAllowedFileTypes).find((i) =>
        i.ext === ext || ext.endsWith(i.ext)
      )?.type,

    MAX_FILE_SIZE: 20 * 1024 * 1024,

    USER_FEED_POSTS: 15,
    TRENDING_POSTS: 20,

    RATING: {
      min: 1,
      max: 5,
    },
  },
  User: {
    USERNAME: {
      min_chars: 4,
      max_chars: 30,
    },

    UPDATE_IMAGE_TIME_MS: 7 * 24 * 60 * 60 * 1000,
    UPDATE_NAME_TIME_MS: 31 * 24 * 60 * 60 * 1000,

    PROFILE_PICTURE: {
      ALLOWED_PROFILE_PICTURE_FILE_EXTENSIONS_LIST: Object.values(BLOBAllowedFileTypes)
        .filter(i => i.type.startsWith("image"))
        .map((i) => `.${i.ext}`),

      MAX_IMAGE_SIZE_MB: 20,
    }
  },
  Feed: {
    NAME: {
      min_chars: 1,
      max_chars: 20,
    },
    MIN_TOPICS: 0,
    MAX_TOPICS: 8,

    MIN_AUTHORS: 0,
    MAX_AUTHORS: 8,
  },
  Topics: {
    TOP_AUTHORS_COUNT: 20,
    NAME: {
      min_chars: 2,
      max_chars: 30,
    },
  },
};

export const Dates: Record<svct.inputs.post.PossibleDates, Date> = {
  "yesterday": new Date(Date.now() - 24 * 60 * 60 * 1000),
  "week": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  "year": new Date(
    (new Date()).getFullYear() - 1,
    (new Date()).getMonth(),
    (new Date()).getDate(),
  ),
};
