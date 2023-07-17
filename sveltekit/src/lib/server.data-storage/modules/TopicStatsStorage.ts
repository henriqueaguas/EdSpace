import { Paging, type ResultWithPaging, type UnparsedPaging } from '$lib/utils/Paging';
import { forceRunInTransaction, PrismaDataStorageComponent } from '../_TransactionalStorage';
import { TopicStatsSchema } from '../OutputTransformers/topic';

export interface ITopicStatsStorage {
	search(
		q?: string,
		unparsedPaging?: UnparsedPaging
	): Promise<ResultWithPaging<ttopic.TopicStats>>;

	byId(topicId: string): Promise<null | ttopic.TopicStats>;

	followedByUser(
		userId: string,
		unparsedPaging?: UnparsedPaging
	): Promise<ResultWithPaging<ttopic.TopicStats>>;

	areFollowedBy(
		topics: string[],
		userId: string
	): Promise<{ following: string[]; notFollowing: string[] }>;

	get10Random(): Promise<ttopic.TopicStats[]>
}

export class PrismaTopicStatsStorage
	extends PrismaDataStorageComponent
	implements ITopicStatsStorage {

	async get10Random() {
		const totalTopics = await this._prismaClient.topic_stats.count()
		const randomSkip = Math.floor(Math.random() * totalTopics);

		return this._prismaClient.topic_stats.findMany({
			skip: randomSkip,
			take: 10
		}).then((ress) => ress.map(TopicStatsSchema.parseSync))
	}

	async areFollowedBy(topics: string[], userId: string) {
		const topicsFollowed = await this._prismaClient.topic_follow
			.findMany({
				where: {
					topic_id: {
						in: topics
					},
					follower_id: userId
				}
			})
			.then((topicsFollowed) => topicsFollowed.map((t) => t.topic_id));

		return {
			following: topicsFollowed,
			notFollowing: topics.filter((t) => !topicsFollowed.includes(t))
		};
	}

	async followedByUser(
		userId: string,
		unparsedPaging?: UnparsedPaging
	): Promise<ResultWithPaging<ttopic.TopicStats>> {
		const paging = new Paging(unparsedPaging);

		const [results, totalCount] = await forceRunInTransaction(
			this._prismaClient,
			(tx) =>
				Promise.all([
					tx.topic_stats
						.findMany({
							where: {
								topic: {
									topic_follow: {
										every: {
											follower_id: userId
										}
									}
								}
							},
							take: paging?.take,
							skip: paging?.skip
						})
						.then((ress) => ress.map(TopicStatsSchema.parseSync)),
					tx.topic_stats.count({
						where: {
							topic: {
								topic_follow: {
									every: {
										follower_id: userId
									}
								}
							}
						}
					})
				]),
		);

		return paging.build(results, totalCount);
	}

	async search(q?: string | undefined, unparsedPaging?: UnparsedPaging | undefined) {
		const paging = new Paging(unparsedPaging);

		const [results, totalCount] = await forceRunInTransaction(
			this._prismaClient,
			(tx) =>
				Promise.all([
					tx.topic_stats
						.findMany({
							where: {
								id: {
									contains: q || '',
									mode: 'insensitive'
								}
							},
							take: paging?.take,
							skip: paging?.skip
						})
						.then((ress) => ress.map(TopicStatsSchema.parseSync)),

					tx.topic_stats.count({
						where: {
							id: {
								contains: q || '',
								mode: 'insensitive'
							}
						}
					})
				]),
		);

		return paging.build(results, totalCount);
	}

	async byId(topicId: string) {
		const topic = await this._prismaClient.topic_stats.findUnique({
			where: {
				id: topicId
			}
		});

		if (!topic) return null;
		return TopicStatsSchema.parseSync(topic);
	}
}
