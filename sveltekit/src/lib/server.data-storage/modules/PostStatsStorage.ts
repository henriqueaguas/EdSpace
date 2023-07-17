import { Dates, LogicConstraints } from '$lib/services/constraints';
import { Paging, type ResultWithPaging, type UnparsedPaging } from '$lib/utils/Paging';
import { when } from '$lib/utils/when';
import { PostStatsSchema } from '../OutputTransformers/post';
import { forceRunInTransaction, PrismaDataStorageComponent } from '../_TransactionalStorage';

export interface IPostStatsStorage {
	byId(postId: string): Promise<null | tpost.PostStats>;

	search<F extends { hasTopics?: string[]; difficulty?: tpost.Difficulty }>(
		q?: string,
		paging?: UnparsedPaging,
		filter?: F
	): Promise<ResultWithPaging<tpost.PostStats>>;

	trending(timing: svct.inputs.post.PossibleDates, topics?: string[]): Promise<tpost.PostStats[]>;

	publishedByUser(
		userId: string,
		paging?: UnparsedPaging
	): Promise<ResultWithPaging<tpost.PostStats>>;

	savedByUser(
		userId: string,
		paging?: UnparsedPaging
	): Promise<ResultWithPaging<tpost.PostStats>>;

	getPostMyInfo(
		postId: string,
		myUserId: string
	): Promise<{ post_id: string } & Difference<tpost.PostMyInfo, tpost.PostStats>>;
}

export class PrismaPostStatsStorage
	extends PrismaDataStorageComponent
	implements IPostStatsStorage {

	async getPostMyInfo(postId: string, myUserId: string) {
		const [hasRead, hasRated, hasSaved] = await forceRunInTransaction(
			this._prismaClient,
			async (tx) =>
				Promise.all([
					tx.post_view
						.findUnique({
							where: {
								user_id_post_id: {
									post_id: postId,
									user_id: myUserId
								}
							}
						}),
					tx.post_rating
						.findUnique({
							where: {
								user_id_post_id: {
									post_id: postId,
									user_id: myUserId
								}
							}
						}),
					tx.saved_post
						.findUnique({
							where: {
								user_id_post_id: {
									post_id: postId,
									user_id: myUserId
								}
							}
						})
				])
		);

		return {
			post_id: postId,
			i_read: hasRead !== null,
			i_saved: hasSaved !== null,
			i_rated: hasRated?.rating || null
		}
	}

	async savedByUser(userId: string, unparsedPaging?: UnparsedPaging | undefined) {
		const paging = new Paging(unparsedPaging);

		const [results, totalCount] = await forceRunInTransaction(
			this._prismaClient,
			(tx) =>
				Promise.all([
					tx.post_stats
						.findMany({
							where: {
								post: {
									saved_post: {
										some: {
											user_id: userId
										}
									}
								}
							},
							include: { author: true },
							take: paging?.take,
							skip: paging?.skip
						})
						.then((results) => results.map((p) => PostStatsSchema.parseSync(p))),

					tx.post_stats.count({
						where: {
							post: {
								saved_post: {
									some: {
										user_id: userId
									}
								}
							}
						}
					})
				])
		);

		return paging.build(results, totalCount);
	}

	async publishedByUser(userId: string, unparsedPaging?: UnparsedPaging | undefined) {
		const paging = new Paging(unparsedPaging);

		const [results, totalCount] = await forceRunInTransaction(
			this._prismaClient,
			(tx) =>
				Promise.all([
					tx.post_stats
						.findMany({
							where: {
								author_id: userId
							},
							include: {
								author: true
							},
							take: paging?.take,
							skip: paging?.skip
						})
						.then((results) => results.map(PostStatsSchema.parseSync)),

					tx.post_stats.count({
						where: {
							author_id: userId
						}
					})
				]),
		);

		return paging.build(results, totalCount);
	}

	async byId(postId: string) {
		const post = await this._prismaClient.post_stats.findUnique({
			where: {
				id: postId
			},
			include: { author: true }
		});

		if (!post) return null;
		return PostStatsSchema.parseSync(post);
	}

	async search<
		F extends {
			hasTopics?: string[] | undefined;
			difficulty?: tpost.Difficulty | undefined;
		}
	>(q?: string | undefined, unparsedPaging?: UnparsedPaging | undefined, filter?: F | undefined) {
		const paging = new Paging(unparsedPaging);

		const [results, totalCount] = await forceRunInTransaction(
			this._prismaClient,
			(tx) =>
				Promise.all([
					tx.post_stats
						.findMany({
							where: {
								OR: [
									{
										title: {
											contains: q || '',
											mode: 'insensitive'
										}
									},
									{
										description: {
											contains: q || '',
											mode: 'insensitive'
										}
									}
								],
								topics: filter?.hasTopics
									? {
										hasSome: filter.hasTopics
									}
									: undefined,
								difficulty: filter?.difficulty
							},
							include: {
								author: true
							},
							take: paging?.take,
							skip: paging?.skip
						})
						.then((results) => results.map(PostStatsSchema.parseSync)),

					tx.post_stats.count({
						where: {
							OR: [
								{
									title: {
										contains: q || '',
										mode: 'insensitive'
									}
								},
								{
									description: {
										contains: q || '',
										mode: 'insensitive'
									}
								}
							],
							topics: filter?.hasTopics
								? {
									hasSome: filter.hasTopics
								}
								: undefined,
							difficulty: filter?.difficulty
						}
					})
				]),
		);

		return paging.build(results, totalCount);
	}

	async trending(timing: svct.inputs.post.PossibleDates, topics?: string[]) {
		return this._prismaClient.post_stats
			.findMany({
				where: {
					topics:
						topics !== undefined
							? {
								hasSome: topics
							}
							: undefined,
					created_at: {
						gt: when(timing, {
							yesterday: Dates.yesterday,
							week: Dates.week,
							year: Dates.year,
							default: Dates.yesterday
						})
					}
				},
				include: {
					author: true
				},
				orderBy: {
					score: 'asc'
				},
				take: LogicConstraints.Posts.TRENDING_POSTS
			})
			.then((results) => results.map(PostStatsSchema.parseSync));
	}
}
