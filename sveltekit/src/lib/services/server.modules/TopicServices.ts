import {
	AlreadyFollowingTopics,
	NotFollowingTopic,
	TopicNotFound,
	UserNotFound
} from '$lib/_errors/LogicError';
import type { IDataStorage } from '$lib/server.data-storage/IDataStorage';
import type { ResultWithPaging, UnparsedPaging } from '$lib/utils/Paging';
import { topicNameSchema, uuid } from '../InputValidators/commonValidators';
import { LogicConstraints } from '../constraints';
import { AmIFollowingTopic, AmIFollowingTopics, AmIFollowingTopicsPaging, AmIFollowingUsers } from '../utils/utils';

export interface ITopicServices {
	search(args?: {
		q?: string;
		paging?: UnparsedPaging;
		myUserId?: string;
	}): Promise<ResultWithPaging<ttopic.TopicStatsMy>>;

	byId(topicId: string, myUserId?: string): Promise<ttopic.TopicStatsMy>;

	follow(topicId: string, followerId: string): Promise<void>;
	unfollow(topicId: string, followerId: string): Promise<void>;

	topAuthors(topicId: string, myUserId?: string): Promise<tuser.UserPublicStatsMy[]>;

	followedByUser(
		userId: string,
		myUserId?: string
	): Promise<ResultWithPaging<ttopic.TopicStatsMy>>;

	get10Random(myUserId: string): Promise<ttopic.TopicStats[]>
}

export class TopicServices implements ITopicServices {
	dataStorage: IDataStorage;

	constructor(dataStorage: IDataStorage) {
		this.dataStorage = dataStorage;
	}

	get10Random(myUserId: string): Promise<ttopic.TopicStats[]> {
		const parsedMyUserId = uuid.parseSync(myUserId);

		return this.dataStorage._useTransaction(async tx => {
			const topics = await this.dataStorage.topicStats.get10Random()
			return AmIFollowingTopics(tx, topics, parsedMyUserId)
		})
	}

	async search(args?: {
		q?: string | undefined;
		paging?: UnparsedPaging | undefined;
		myUserId?: string;
	}) {
		const parsedMyUserId = args?.myUserId ? uuid.parseSync(args.myUserId) : undefined;

		return this.dataStorage._useTransaction(async (tx) => {
			const topics = await tx.topicStats.search(args?.q, args?.paging);

			return AmIFollowingTopicsPaging(tx, topics, parsedMyUserId);
		});
	}

	async byId(topicId: string, myUserId?: string) {
		const parsedTopicId = topicNameSchema.parseSync(topicId);
		const parsedMyUserId = myUserId ? uuid.parseSync(myUserId) : undefined;

		return this.dataStorage._useTransaction(async (tx) => {
			let topic = await tx.topicStats.byId(parsedTopicId);
			if (!topic) throw TopicNotFound;

			return AmIFollowingTopic(tx, topic, parsedMyUserId);
		});
	}

	async topAuthors(topicId: string, myUserId?: string) {
		const parsedTopicId = topicNameSchema.parseSync(topicId);
		const parsedMyUserId = myUserId ? uuid.parseSync(myUserId) : undefined;

		return this.dataStorage._useTransaction(async (tx) => {
			const authors = await tx.userStats
				.ranking(parsedTopicId, {
					take: LogicConstraints.Topics.TOP_AUTHORS_COUNT
				})
				.then((results) => results.data);

			return AmIFollowingUsers(tx, authors, parsedMyUserId);
		});
	}

	async followedByUser(userId: string, myUserId?: string) {
		const parsedId = uuid.parseSync(userId);
		const parsedMyUserId = myUserId ? uuid.parseSync(myUserId) : undefined;

		return this.dataStorage._useTransaction(async (tx) => {
			if (!(await tx.user.exist([parsedId])).success) {
				throw UserNotFound;
			}

			const topics = await tx.topicStats.followedByUser(parsedId);

			return AmIFollowingTopicsPaging(tx, topics, parsedMyUserId);
		});
	}

	async follow(topicId: string, followerId: string): Promise<void> {
		const parsedTopicId = topicNameSchema.parseSync(topicId);
		const parsedFollowerId = uuid.parseSync(followerId);

		await this.dataStorage._useTransaction(async (tx) => {
			if (await tx.topic.isFollowedByUser(parsedTopicId, parsedFollowerId)) {
				throw AlreadyFollowingTopics;
			}

			await tx.topic.follow(parsedTopicId, parsedFollowerId);
		});
	}

	async unfollow(topicId: string, followerId: string): Promise<void> {
		const parsedTopicId = topicNameSchema.parseSync(topicId);
		const parsedFollowerId = uuid.parseSync(followerId);

		await this.dataStorage._useTransaction(async (tx) => {
			if (!(await tx.topic.isFollowedByUser(parsedTopicId, parsedFollowerId))) {
				throw NotFollowingTopic;
			}

			await tx.topic.unfollow(parsedTopicId, parsedFollowerId);
		});
	}
}
