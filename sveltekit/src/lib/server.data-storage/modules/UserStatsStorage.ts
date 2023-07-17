import { topicsSchema } from '$lib/services/InputValidators/commonValidators';
import { Paging, type ResultWithPaging, type UnparsedPaging } from '$lib/utils/Paging';
import type { user_stats } from '@prisma/client';
import { forceRunInTransaction, PrismaDataStorageComponent } from '../_TransactionalStorage';
import { UserPrivateStatsSchema, UserPublicStatsSchema } from '../OutputTransformers/user';

export interface IUserStatsStorage {
	publicById(userId: string): Promise<null | tuser.UserPublicStats>;

	privateById(userId: string): Promise<null | tuser.UserPrivateStats>;

	followers(
		userId: string,
		paging: UnparsedPaging | undefined
	): Promise<ResultWithPaging<tuser.UserPublicStats>>;

	follows(
		userId: string,
		paging: UnparsedPaging | undefined
	): Promise<ResultWithPaging<tuser.UserPublicStats>>;

	ranking(
		topicId: string | undefined,
		unparsedPaging: UnparsedPaging | undefined
	): Promise<ResultWithPaging<tuser.UserPublicStats>>;

	search(
		q: string | undefined,
		unparsedPaging: UnparsedPaging | undefined
	): Promise<ResultWithPaging<tuser.UserPublicStats>>;

	areFollowedBy(
		userIds: string[],
		userId: string
	): Promise<{ following: string[]; notFollowing: string[] }>;

	getTopAuthorsForTopics(topicIds: string[]): Promise<tuser.UserPublicStats[]>
}

export class PrismaUserStatsStorage
	extends PrismaDataStorageComponent
	implements IUserStatsStorage {

	async getTopAuthorsForTopics(topicIds: string[]) {
		return Promise.all(
			topicIds.map(tid => this._prismaClient.user_stats.findFirst({
				where: {
					topics_user_publishes_on: {
						has: tid
					}
				},
				orderBy: {
					score: "desc"
				}
			}))
		).then(res =>
			(res.filter(r => r !== null) as user_stats[])
				.map(u => UserPublicStatsSchema.parseSync(u))
				// remove duplicates
				.filter((item, index, arr) => arr.findIndex((el) => el.id === item.id) === index)
		)
	}

	async areFollowedBy(userIds: string[], userId: string) {
		const usersFollowed = await this._prismaClient.user_follow
			.findMany({
				where: {
					user_id: {
						in: userIds
					},
					follower_id: userId
				}
			})
			.then((userFollows) => userFollows.map((u) => u.user_id));

		return {
			following: usersFollowed,
			notFollowing: userIds.filter((u) => !usersFollowed.includes(u))
		};
	}

	async ranking(topicId?: string, unparsedPaging?: UnparsedPaging) {
		const paging = new Paging(unparsedPaging);

		const [users, totalCount] = await forceRunInTransaction(
			this._prismaClient,
			(tx) =>
				Promise.all([
					tx.user_stats
						.findMany({
							where: {
								...(topicId
									? {
										topics_user_publishes_on: {
											has: topicId,
										}
									}
									: {
										topics_user_publishes_on: {
											isEmpty: false,
										}
									})
							},
							orderBy: {
								score: 'desc'
							},
							take: paging.take,
							skip: paging.skip
						})
						.then((res) => res.map(UserPublicStatsSchema.parseSync)),

					tx.user_stats.count({
						where: {
							...(topicId
								? {
									topics_user_publishes_on: {
										has: topicId,
									}
								} : {
									topics_user_publishes_on: {
										isEmpty: false,
									}
								})
						}
					})
				]),
		);

		const results = paging.build(users, totalCount);

		// Needed since the ranking_position on the DB is on the global ranking and not per topic
		if (topicId) {
			results.data.forEach((u, idx) => {
				u.ranking_position = paging.take * (results.currentPage - 1) + idx + 1
			})
		}

		return results
	}

	async followers(userId: string, unparsedPaging?: UnparsedPaging) {
		const paging = new Paging(unparsedPaging);

		const [results, totalCount] = await forceRunInTransaction(this._prismaClient, (tx) =>
			Promise.all([
				tx.user_stats
					.findMany({
						where: {
							user: {
								follows: {
									some: { user_id: userId }
								}
							}
						},
						skip: paging.skip,
						take: paging.take
					})
					.then((followers) => followers.map(UserPublicStatsSchema.parseSync)),

				tx.user.count({
					where: {
						follows: {
							some: { user_id: userId }
						}
					}
				})
			])
		);

		return paging.build(results, totalCount);
	}

	async follows(userId: string, unparsedPaging?: UnparsedPaging) {
		const paging = new Paging(unparsedPaging);

		const [results, totalCount] = await forceRunInTransaction(this._prismaClient, (tx) =>
			Promise.all([
				this._prismaClient.user_stats
					.findMany({
						where: {
							user: {
								followers: {
									some: { follower_id: userId }
								}
							}
						},
						skip: paging.skip,
						take: paging.take
					})
					.then((followers) => followers.map(UserPublicStatsSchema.parseSync)),
				tx.user.count({
					where: {
						followers: {
							some: { follower_id: userId }
						}
					}
				})
			])
		);

		return paging.build(results, totalCount);
	}

	async publicById(userId: string) {
		const user = await this._prismaClient.user_stats.findUnique({
			where: {
				id: userId
			}
		});
		if (!user) return null;
		return UserPublicStatsSchema.parseSync(user);
	}

	async privateById(userId: string) {
		const user = await this._prismaClient.user_stats.findUnique({
			where: {
				id: userId
			}
		});

		if (!user) return null;
		return UserPrivateStatsSchema.parseSync(user);
	}

	async search(q?: string, unparsedPaging?: UnparsedPaging) {
		const paging = new Paging(unparsedPaging);

		const [users, totalCount] = await Promise.all([
			this._prismaClient.user_stats
				.findMany({
					where: {
						name: { contains: q || '', mode: 'insensitive' }
					},
					skip: paging.skip,
					take: paging.take
				})
				.then((users) => users.map(UserPublicStatsSchema.parseSync)),
			this._prismaClient.user.count({
				where: {
					name: { contains: q || '', mode: 'insensitive' }
				}
			})
		]);

		return paging.build(users, totalCount);
	}
}
