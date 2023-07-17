// See https://kit.svelte.dev/docs/types#app

import type { z } from "zod";
import type { feed, post, topic, user, user_stats, post_stats } from "@prisma/client";
import type { FieldErrors } from "$lib/_errors/ParseObjectError";

// for information about these interfaces
declare global {
  namespace App {
    interface Error {
      name: string;
      message: string;
      fieldErrors?: FieldErrors;
    }
    interface Session {
      user: user;
      expires: ISODateString;
    }
    interface Locals {
      session: Session;
    }
    // interface PageData {}
  }

  // Data Storage Input/Output Types
  export namespace dst {
    export namespace inputs {
      export namespace post {
        export type Create =
          & SafeOmit<
            post,
            "created_at" | "id"
          >
          & { topics: string[] };
      }

      export namespace user {
        export type Create = {
          name: string;
          email: string;
        };
      }
    }
  }

  // Services Input/Output Types
  export namespace svct {
    export namespace inputs {
      export namespace post {
        export type Create = SafeOmit<
          post & { topics: string[] },
          "id" | "created_at" | "author_id"
        >;

        export type PossibleDates =
          | "yesterday"
          | "week"
          | "year";
      }

      export namespace user {
        export type Create = Pick<
          tuser.UserPrivateStats,
          | "email"
          | "name"
        >;

        export type RankingSelectors =
          | "global"
          | "topic";
      }
    }

    export namespace outputs {
      export namespace feed {
        export type Update = {
          feed: tfeed.Feed;
          topics: string[];
          authors: string[];
        };
      }

      export namespace post {
        export type ById<
          T extends "no-pages" | "pages",
        > = {
          metadata: tpost.PostMyInfo;
          pages: T extends "pages" ? PostPage[] : undefined;
        };
      }
    }
  }

  export namespace tfeed {
    export type Feed = feed;
  }

  export namespace tpost {
    export type Post = post;

    export type PostStats = SafeOmit<post, "author_id"> & _JustPostStats & {
      author: Pick<
        tuser.UserPublicStats,
        "id" | "name" | "image" | "created_at"
      >;
      topics: string[];
    };

    export type PostMyInfo =
      & PostStats
      & {
        i_read: boolean | null;
        i_saved: boolean | null;
        i_rated: number | null;
      };

    type _JustPostStats = ChangeType<
      Pick<
        post_stats,
        | "ranking_position"
        | "avg_rating"
        | "rates_count"
        | "views_count"
      >,
      {
        ranking_position: number;
        avg_rating: number;
        rates_count: number;
        views_count: number;
      }
    >;

    export type PostPageType = "Markdown" | "PDF" | "Image" | "Quiz";

    export type PostPage =
      | {
        type: Exclude<PostPageType, "Quiz">;
        remoteUrl: string;
      }
      | {
        type: "Quiz";
        quiz: svct.quiz.Quiz;
      };

    export type Difficulty = difficulty | null;
  }

  export namespace tquiz {
    export type Quiz = {
      name: string;
      questions: Array<QuizQuestion>;
    };

    export type QuizQuestion = {
      title: string;
      answers: Array<{
        answer: string;
        isCorrect: boolean;
      }>;
    };
  }

  export namespace tuser {
    export type User = user;

    export type UserPublicStats =
      & Pick<user, "id" | "name" | "created_at" | "image">
      & _UserStats;

    export type UserPrivateStats = user & _UserStats;

    export type UserPublicStatsMy = UserPublicStats & {
      am_i_following: boolean | null;
    };

    type _UserStats =
      & ChangeType<
        Pick<
          user_stats,
          | "followers_count"
          | "avg_post_rating"
          | "ranking_position"
          | "score"
        >,
        {
          ranking_position: number | null;
          avg_post_rating: number;
          followers_count: number;
        }
      >
      & {
        topics_user_publishes_on: string[];
        posts_published: number;
      };
  }

  export namespace ttopic {
    export type Topic = topic;

    export type TopicStats = topic & {
      posts_count: number;
      followers_count: number;
    };

    export type TopicStatsMy = TopicStats & { am_i_following: boolean };
  }

  export namespace tsession {
    export type Session = session;
  }

  export type ApiEndpointMethodDefinition<
    Q extends {
      [k: string]: string | number | boolean | string[] | number[] | boolean[];
    } | undefined,
    B,
    R,
  > =
    & { responseType: R }
    & (
      Q extends undefined ? {}
      : { query: Q }
    )
    & (
      B extends undefined ? {}
      : { body: B }
    );

  export type Difference<T, U> = Omit<T, keyof U>;
  export type SafeOmit<T, K extends keyof T> = Omit<T, K>;
  export type Difference<T, U> = Pick<T, Exclude<keyof T, keyof U>>;
  export type ChangeType<T, Changes extends { [K in keyof T]?: any }> =
    & SafeOmit<T, keyof Changes>
    & { [P in keyof Changes]: Changes[P] };
}
