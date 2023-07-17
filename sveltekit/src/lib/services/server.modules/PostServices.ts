import {
  CannotRateOwnPost,
  ExceededMaxFileSize,
  InvalidFileType,
  OnlyOwnerCanPerform,
  PostAlreadyViewed,
  PostNotFound,
  PostPagesConstraint,
  PostPagesNotFound,
  RepeatedTopics,
  TopicsNotFound,
} from "$lib/_errors/LogicError";
import type { IBlobStorage } from "$lib/server.blob-storage/IBlobStorage";
import type { IDataStorage } from "$lib/server.data-storage/IDataStorage";
import type { ResultWithPaging, UnparsedPaging } from "$lib/utils/Paging";
import { typeCheck } from "$lib/utils/typeCheck";
import { ratingSchema, uuid } from "../InputValidators/commonValidators";
import {
  CreatePostInputSchema,
  PossibleDatesSchema,
} from "../InputValidators/post";
import { QuizSchema } from "../InputValidators/quiz";
import { BLOBAllowedFileTypes, LogicConstraints } from "../constraints";
import { hasRepetitions } from "../utils/findRepetitions";
import { PostMyInfo } from "../utils/utils";

export interface IPostServices {
  create(
    userId: string,
    postInput: svct.inputs.post.Create,
    postPages: Blob[],
  ): Promise<tpost.Post["id"]>;

  delete(postId: string, userId: string): Promise<tpost.Post["id"]>;
  rate(postId: string, userId: string, rating: number): Promise<void>;
  view(postId: string, userId: string): Promise<void>;

  byId<
    S extends {
      pages?: boolean;
    },
  >(
    postId: string,
    selection?: S,
    myUserId?: string,
  ): Promise<
    S["pages"] extends true ? svct.outputs.post.ById<"pages">
    : svct.outputs.post.ById<"no-pages">
  >;

  search<F extends { hasTopics?: string[]; difficulty?: tpost.Difficulty }>(
    args: {
      q?: string;
      paging?: UnparsedPaging;
      filter?: F;
    },
  ): Promise<ResultWithPaging<tpost.PostStats>>;

  fromUser(
    userId: string,
    unparsedPaging?: UnparsedPaging,
  ): Promise<ResultWithPaging<tpost.PostStats>>;

  trending(
    timing: svct.inputs.post.PossibleDates,
    topics?: string[],
  ): Promise<Array<tpost.PostStats>>;
}

export class PostServices implements IPostServices {
  dataStorage: IDataStorage;
  blobStorage: IBlobStorage;

  constructor(
    dataStorage: IDataStorage,
    blobStorage: IBlobStorage,
  ) {
    this.dataStorage = dataStorage;
    this.blobStorage = blobStorage;
  }

  async create(
    userId: string,
    postInput: svct.inputs.post.Create,
    pages: Blob[],
  ) {
    const parsedPostMd = CreatePostInputSchema.parseSync(postInput);
    const parsedUserId = uuid.parseSync(userId);

    if (hasRepetitions(postInput.topics)) {
      throw RepeatedTopics;
    }

    return this.dataStorage._useTransaction(async (tx) => {
      const topicsLookup = await tx.topic.exist(postInput.topics);
      if (!topicsLookup.success) {
        throw TopicsNotFound(topicsLookup.nonExisting);
      }

      if (
        pages.length === 0 ||
        pages.length > LogicConstraints.Posts.MAX_POST_PAGES
      ) {
        throw PostPagesConstraint;
      }

      for (const pageFile of pages) {
        if (
          !LogicConstraints.Posts.ALLOWED_FILE_TYPES_LIST.includes(
            pageFile.type,
          )
        ) {
          throw InvalidFileType;
        }

        if (pageFile.size > LogicConstraints.Posts.MAX_FILE_SIZE) {
          throw ExceededMaxFileSize(pageFile.size);
        }

        if (pageFile.type === BLOBAllowedFileTypes.QUIZ.type) {
          const quizContent = JSON.parse(await pageFile.text());
          // throws if not valid
          QuizSchema.parseSync(quizContent);
        }
      }

      const newPostId = await tx.post.create({
        ...parsedPostMd,
        author_id: parsedUserId,
      });

      await this.blobStorage.uploadPostPages(
        newPostId,
        pages,
      );

      return newPostId;
    });
  }

  async trending(timing: svct.inputs.post.PossibleDates, topics?: string[]) {
    PossibleDatesSchema.parseSync(timing);
    return this.dataStorage.postStats.trending(timing, topics);
  }

  async delete(postId: string, userId: string) {
    const parsedPostId = uuid.parseSync(postId);
    const parsedUserId = uuid.parseSync(userId);

    return this.dataStorage._useTransaction(async (tx) => {
      const post = await tx.postStats.byId(parsedPostId);
      if (!post) {
        throw PostNotFound;
      }
      if (post.author.id !== parsedUserId) {
        throw OnlyOwnerCanPerform;
      }

      const [deletedPostId] = await Promise.all([
        this.dataStorage.post.delete(parsedPostId),
        this.blobStorage.deletePostPages(parsedPostId),
      ]);

      return deletedPostId;
    });
  }

  async rate(postId: string, myUserId: string, rating_num: number) {
    const parsedRating = ratingSchema.parseSync(rating_num);
    const parsedPostId = uuid.parseSync(postId);
    const parsedUserId = uuid.parseSync(myUserId);

    return this.dataStorage._useTransaction(async (tx) => {
      const post = await tx.postStats.byId(parsedPostId);
      if (!post) {
        throw PostNotFound;
      }

      if (myUserId === post.author.id) {
        throw CannotRateOwnPost;
      }

      return tx.post.rate(parsedPostId, parsedUserId, parsedRating);
    });
  }

  async view(postId: string, userId: string) {
    const parsedPostId = uuid.parseSync(postId);
    const parsedUserId = uuid.parseSync(userId);

    return this.dataStorage._useTransaction(async (tx) => {
      if (!(await tx.post.exists(parsedPostId))) {
        throw PostNotFound;
      }

      if (!(await tx.user.exist([parsedUserId])).success) {
        throw PostNotFound;
      }

      if (await tx.post.hasViewed(parsedPostId, parsedUserId)) {
        throw PostAlreadyViewed;
      }

      return tx.post.view(parsedPostId, parsedUserId);
    });
  }

  async byId<S extends { pages?: boolean }>(
    postId: string,
    selection?: S,
    myUserId?: string,
  ) {
    const parsedPostId = uuid.parseSync(postId);
    const parsedMyUserId = !myUserId ? undefined : uuid.parseSync(myUserId);

    const postMyInfo: tpost.PostMyInfo = await this.dataStorage._useTransaction(async (tx) => {
      const post = await tx.postStats.byId(parsedPostId);

      if (!post) {
        throw PostNotFound;
      }

      return PostMyInfo(tx, post, parsedMyUserId);
    });

    if (selection?.pages) {
      const postPages = await this.blobStorage.getPostPages(parsedPostId);

      if (!postPages) {
        throw PostPagesNotFound;
      }

      return typeCheck<svct.outputs.post.ById<"pages">>({
        metadata: postMyInfo,
        pages: postPages,
      });
    } else {
      return typeCheck<svct.outputs.post.ById<"no-pages">>({
        metadata: postMyInfo,
        pages: undefined,
      });
    }
  }

  async search<
    F extends { hasTopics?: string[]; difficulty?: tpost.Difficulty },
  >(args: {
    q?: string;
    paging?: UnparsedPaging;
    filter?: F;
  }) {
    return this.dataStorage.postStats.search(
      args.q,
      args.paging,
      args.filter,
    );
  }

  fromUser(userId: string, paging?: UnparsedPaging) {
    return this.dataStorage.postStats.publishedByUser(userId, paging);
  }
}
