import { UnexpectedError } from '$lib/_errors/AppError';
import {
	AlreadyFollowingUser,
	CannotFollowSelf,
	LargeImageSize,
	NotFollowingUser,
	TopicsNotFound,
	UserNotFound,
	UsernameAlreadyTaken,
	UsersNotFound
} from '$lib/_errors/LogicError';
import type { IBlobStorage } from '$lib/server.blob-storage/IBlobStorage';
import type { IDataStorage } from '$lib/server.data-storage/IDataStorage';
import type { ResultWithPaging, UnparsedPaging } from '$lib/utils/Paging';
import { searchQuerySchema, topicNameSchema, topicNamesSchema, topicsSchema, uuid } from '../InputValidators/commonValidators';
import { CreateUserInputSchema } from '../InputValidators/user';
import { LogicConstraints } from '../constraints';
import { AmIFollowingUser, AmIFollowingUsers, AmIFollowingUsersPaging } from '../utils/utils';

export interface IUserServices {
	create(
		user: svct.inputs.user.Create,
		profilePicture?: Blob
	): Promise<tuser.UserPublicStats['id']>;

	publicById(userId: string, myUserId?: string): Promise<tuser.UserPublicStatsMy>;

	follow(followerId: string, userId: string): Promise<void>;
	unfollow(followerId: string, userId: string): Promise<void>;
	isFollowedByUser(userId: string, followerId: string): Promise<boolean>;

	followers(
		userId: string,
		paging?: UnparsedPaging,
		myUserId?: string
	): Promise<ResultWithPaging<tuser.UserPublicStatsMy>>;

	follows(
		userId: string,
		paging?: UnparsedPaging,
		myUserId?: string
	): Promise<ResultWithPaging<tuser.UserPublicStatsMy>>;

	search(args: {
		q?: string;
		unparsedPaging?: UnparsedPaging;
		myUserId?: string;
	}): Promise<ResultWithPaging<tuser.UserPublicStatsMy>>;

	ranking(args: {
		topicId?: string;
		unparsedPaging?: UnparsedPaging;
		myUserId?: string;
	}): Promise<ResultWithPaging<tuser.UserPublicStatsMy>>;

	getTopAuthorsForTopics(topicIds: string[], myUserId: string): Promise<tuser.UserPublicStats[]>
}

export class UserServices implements IUserServices {
	dataStorage: IDataStorage;
	blobStorage: IBlobStorage;

	constructor(dataStorage: IDataStorage, blobStorage: IBlobStorage) {
		this.dataStorage = dataStorage;
		this.blobStorage = blobStorage;
	}

	async getTopAuthorsForTopics(topicIds: string[], myUserId: string) {
		const parsedTopicIds = topicNamesSchema.parseSync(topicIds);
		const parsedMyUserId = uuid.parseSync(myUserId);

		return this.dataStorage._useTransaction(async tx => {
			const topicsExist = await tx.topic.exist(parsedTopicIds);
			if (!topicsExist.success) {
				throw TopicsNotFound(topicsExist.nonExisting);
			}

			const users = await tx.userStats.getTopAuthorsForTopics(parsedTopicIds)
			return AmIFollowingUsers(tx, users, parsedMyUserId)
		})
	}

	async create(user: svct.inputs.user.Create, profilePicture?: Blob) {
		const parsedUserData = CreateUserInputSchema.parseSync(user);

		return this.dataStorage._useTransaction(async (tx) => {
			if (await tx.user.existsByUsername(user.name)) {
				throw UsernameAlreadyTaken
			}

			const userId = await tx.user.create(parsedUserData);

			if (profilePicture) {
				if (profilePicture.length * 1024 * 1024 > LogicConstraints.User.PROFILE_PICTURE.MAX_IMAGE_SIZE_MB) {
					throw LargeImageSize;
				}

				// Hold the URL to the remote location of the image (after uploaded)
				let profilePictureBLOBUrl;
				try {
					profilePictureBLOBUrl = await this.blobStorage.uploadProfilePicture(
						userId,
						profilePicture satisfies Blob
					);
				} catch (err) {
					// Improve the error message give by giving some context
					throw UnexpectedError(
						'An error occurred while uploading image file to BLOB storage: ' + (err as any).message
					);
				}
				tx.me.updateProfilePicture(userId, profilePictureBLOBUrl);
			}
			return userId;
		});
	}

	ranking(args?: { topicId?: string; unparsedPaging?: UnparsedPaging; myUserId?: string }) {
		const parsedMyUserId = args && args.myUserId ? uuid.parseSync(args.myUserId) : undefined;

		const parsedTopicId =
			args && args.topicId ? topicNameSchema.parseSync(args.topicId) : undefined;

		return this.dataStorage._useTransaction(async (tx) => {
			const ranking = await tx.userStats.ranking(parsedTopicId, args?.unparsedPaging);

			return AmIFollowingUsersPaging(tx, ranking, parsedMyUserId);
		});
	}

	followers(userId: string, paging?: UnparsedPaging, myUserId?: string) {
		const parsedUserId = uuid.parseSync(userId);
		const parsedMyUserId = myUserId ? uuid.parseSync(myUserId) : undefined;

		return this.dataStorage._useTransaction(async (tx) => {
			const followers = await tx.userStats.followers(parsedUserId, paging);

			return AmIFollowingUsersPaging(tx, followers, parsedMyUserId);
		});
	}

	follows(userId: string, paging?: UnparsedPaging, myUserId?: string) {
		const parsedUserId = uuid.parseSync(userId);
		const parsedMyUserId = myUserId ? uuid.parseSync(myUserId) : undefined;

		return this.dataStorage._useTransaction(async (tx) => {
			const follows = await tx.userStats.follows(parsedUserId, paging);

			return AmIFollowingUsersPaging(tx, follows, parsedMyUserId);
		});
	}

	async isFollowedByUser(userId: string, followerId: string): Promise<boolean> {
		const parsedUserId = uuid.parseSync(userId);
		const parsedFollowerId = uuid.parseSync(followerId);

		return this.dataStorage._useTransaction(async (tx) => {
			const findUsersRes = await tx.user.exist([parsedUserId, parsedFollowerId]);

			if (!findUsersRes.success) {
				throw UsersNotFound(findUsersRes.nonExisting);
			}

			return tx.user.isFollowedByUser(userId, followerId);
		});
	}

	async publicById(userId: string, myUserId?: string) {
		const parsedId = uuid.parseSync(userId);
		const parsedMyUserId = myUserId ? uuid.parseSync(myUserId) : undefined;

		return this.dataStorage._useTransaction(async (tx) => {
			const user = await tx.userStats.publicById(parsedId);

			if (!user) throw UserNotFound;

			return AmIFollowingUser(tx, user, parsedMyUserId);
		});
	}

	async follow(followerId: string, userId: string) {
		const parsedFollowerId = uuid.parseSync(followerId);
		const parsedUserId = uuid.parseSync(userId);

		await this.dataStorage._useTransaction(async (tx) => {
			if (parsedFollowerId === parsedUserId) {
				throw CannotFollowSelf;
			}

			const usersExist = await tx.user.exist([parsedUserId, parsedFollowerId]);
			if (!usersExist.success) {
				throw UsersNotFound(usersExist.nonExisting);
			}

			if (await tx.user.isFollowedByUser(parsedUserId, parsedFollowerId)) {
				throw AlreadyFollowingUser;
			}

			await tx.user.follow(parsedFollowerId, parsedUserId);
		});
	}

	async unfollow(followerId: string, userId: string) {
		const parsedFollowerId = uuid.parseSync(followerId);
		const parsedUserId = uuid.parseSync(userId);

		await this.dataStorage._useTransaction(async (tx) => {
			const usersExist = await tx.user.exist([parsedUserId, parsedFollowerId]);
			if (!usersExist.success) {
				throw UsersNotFound(usersExist.nonExisting);
			}

			if (!(await tx.user.isFollowedByUser(parsedUserId, parsedFollowerId))) {
				throw NotFollowingUser;
			}

			await tx.user.unfollow(parsedFollowerId, parsedUserId);
		});
	}

	async search(args: { q?: string; unparsedPaging?: UnparsedPaging; myUserId?: string }) {
		let query: string | undefined = undefined;
		if (args.q) {
			query = searchQuerySchema.parseSync(args.q);
		}
		const parsedMyUserId = args.myUserId ? uuid.parseSync(args.myUserId) : undefined;

		return this.dataStorage._useTransaction(async (tx) => {
			const users = await tx.userStats.search(query, args.unparsedPaging);

			return AmIFollowingUsersPaging(tx, users, parsedMyUserId);
		});
	}
}
