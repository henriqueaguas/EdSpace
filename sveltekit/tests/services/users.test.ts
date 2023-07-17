import { blobStorage, prismaClient, services } from '$lib/index.server';
import { afterAll, assert, beforeAll, describe, test } from 'vitest';
import { TEST_USER_1, TEST_USER_2 } from '../objects';
import { assertDoesNotThrow, assertThrows } from '../assertionFunctions';
import { pickRandom } from '../utils';
import { getBlobFromFile } from '../blob-storage/utils';
import jetpack from 'fs-jetpack';
import { LogicError} from '$lib/_errors/LogicError';
import { ErrorCategory } from '$lib/_errors/AppError';

let testUserId1: tuser.UserPrivateStats['id'];
let testUserId2: tuser.UserPrivateStats['id'];

const validEmail = 'test@sapo.pt';
const validName = 'testUser';

describe('[Service] - Users', async () => {
	beforeAll(async () => {
		await Promise.all([prismaClient.user.deleteMany()]);
	});
	//beforeEach
	//afterEach

	afterAll(async () => {
		await Promise.all([prismaClient.user.deleteMany()]);
	});

	describe('CREATE', () => {
		test('Success', async () => {
			const newUserId = await services.user.create({
				email: validEmail,
				name: validName
			});

			// Get user after create
			const user = await services.user.publicById(newUserId);

			assert(user != null);
			assert(user.id === newUserId);
		});

		test('[FAIL] Not valid email', async () => {
			await assertThrows(
				services.user.create({
					email: '',
					name: validName
				}),
				undefined,
				true
			);
		});

		test('[FAIL] Name to short', async () => {
			await assertThrows(
				services.user.create({
					email: validEmail,
					name: 'Me'
				}),
				undefined,
				true
			);
		});

		test('[FAIL] Name to long', async () => {
			await assertThrows(
				services.user.create({
					email: validEmail,
					name: 'Meeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
				}),
				undefined,
				true
			);
		});
	});

	describe('PUBLIC BY ID', async () => {
		beforeAll(async () => {
			testUserId1 = await services.user.create(TEST_USER_1);
		});

		afterAll(async () => {
			await Promise.all([prismaClient.user.deleteMany()]);
		});

		test('Success', async () => {
			const user = await services.user.publicById(testUserId1);

			assert(user != null);
			assert((user.name = TEST_USER_1.name));
			assert(user.followers_count === 0);
			assert(user.posts_published === 0);
			assert(user.score === 0);
		});

		test('[FAIL] Not Exists', async () => {
			await assertThrows(services.user.publicById('123123123'), undefined, true);
		});
	});

	describe('FOLLOW/UNFOLLOW', async () => {
		beforeAll(async () => {
			testUserId1 = await services.user.create(TEST_USER_1);
			testUserId2 = await services.user.create(TEST_USER_2);
		});

		afterAll(async () => {
			await Promise.all([prismaClient.user.deleteMany()]);
		});

		test('[SUCCESS] Follow', async () => {
			await assertDoesNotThrow(services.user.follow(testUserId1, testUserId2));
		});

		test('[FAIL] Not Exists Follow', async () => {
			await assertThrows(services.user.follow(testUserId1, '123123123'), new LogicError(ErrorCategory.Not_Found, "Some Users do not exist: 123123123"));
		});

		test('[SUCCESS] Unfollow', async () => {
			await assertDoesNotThrow(services.user.unfollow(testUserId1, testUserId2));
		});

		test('[FAIL] Not Exists Unfollow', async () => {
			await assertThrows(services.user.unfollow(testUserId1, '123123123'), new LogicError(ErrorCategory.Not_Found, "Some Users do not exist: 123123123"));
		});
	});

	describe('FOLLOWED/FOLLOWS', async () => {
		beforeAll(async () => {
			testUserId1 = await services.user.create(TEST_USER_1);
			testUserId2 = await services.user.create(TEST_USER_2);
		});

		afterAll(async () => {
			await Promise.all([prismaClient.user.deleteMany()]);
		});

		test('[SUCCESS] FollowedByUser', async () => {
			await services.user.follow(testUserId2, testUserId1);
			const followed = await services.user.isFollowedByUser(testUserId1, testUserId2);
			assert(followed === true);
		});

		test('[FAIL] Not FollowedByUser', async () => {
			const followed = await services.user.isFollowedByUser(testUserId2, testUserId1);
			assert(followed === false);
		});

		test('[SUCCESS] Follows', async () => {
			const value = await services.user.follows(testUserId2, undefined, testUserId1);

			assert(value.count === 1);
		});
	});

	describe('FOLLOWERS', async () => {
		beforeAll(async () => {
			testUserId1 = await services.user.create(TEST_USER_1);
			testUserId2 = await services.user.create(TEST_USER_2);
		});

		afterAll(async () => {
			await Promise.all([prismaClient.user.deleteMany()]);
		});

		test('[SUCCESS] Get Followers', async () => {
			await services.user.follow(testUserId2, testUserId1);
			const value = await services.user.followers(testUserId1);
			assert(value.count === 1);
		});

		test('[SUCCESS] Get Followers With Paging', async () => {
			const value = await services.user.followers(testUserId1, { skip: 1 });
			assert(value.count === 0);
		});
	});

	describe('SEARCH', async () => {
		beforeAll(async () => {
			testUserId1 = await services.user.create(TEST_USER_1);
			testUserId2 = await services.user.create(TEST_USER_2);
		});

		afterAll(async () => {
			await Promise.all([prismaClient.user.deleteMany()]);
		});

		test('[SUCCESS] Search Users', async () => {
			const value = await services.user.search({});
			assert(value.count === 2);
		});

		test('[SUCCESS] Search Users With Paging', async () => {
			const value = await services.user.search({ unparsedPaging: { skip: 3 } });
			assert(value.count === 0);
		});
	});

	describe('RANKING', async () => {
		const validTitle = 'REST vs GraphQL vs gRPC';
		const validDescription =
			"REST, GraphQL, and gRPC are the 3 most popular API development technologies in modern web applications. However, choosing one isn't easy since they all have unique features.";
		const validDifficulty: tpost.Difficulty = 'medium';
		const validTopics: string[] = await prismaClient.topic.findMany().then((topics) => {
			const choosenTopics: string[] = [];
			const allTopics = topics.map((t) => t.id);
			for (let i = 0; i < 5; i++) {
				let newTopic = pickRandom(allTopics);
				while (choosenTopics.includes(newTopic)) {
					newTopic = pickRandom(allTopics);
				}
				choosenTopics.push(newTopic);
			}
			return choosenTopics;
		});
		const validCreatePostData = {
			title: validTitle,
			description: validDescription,
			difficulty: validDifficulty,
			topics: validTopics
		};
		const testPostPages = jetpack.cwd('tests/blob-storage/mock-post-pages');
		const validPostPages: Blob[] = await Promise.all(
			testPostPages.list()!.map(async (name) => getBlobFromFile(testPostPages, name))
		);

		beforeAll(async () => {
			await Promise.all([prismaClient.post.deleteMany(), blobStorage.clearAll()]);

			testUserId1 = await services.user.create(TEST_USER_1);
			testUserId2 = await services.user.create(TEST_USER_2);

			await services.post.create(testUserId1, validCreatePostData, validPostPages);
		});

		afterAll(async () => {
			await Promise.all([
				prismaClient.user.deleteMany(),
				prismaClient.post.deleteMany(),
				blobStorage.clearAll()
			]);
		});

		test('[SUCCESS] Global Ranking', async () => {
			const value = await services.user.ranking({});
			assert(value.count === 1);
		});
	});

	describe('TOP AUTHORS', async () => {
		const validTitle = 'REST vs GraphQL vs gRPC';
		const validDescription =
			"REST, GraphQL, and gRPC are the 3 most popular API development technologies in modern web applications. However, choosing one isn't easy since they all have unique features.";
		const validDifficulty: tpost.Difficulty = 'medium';
		const validTopics: string[] = await prismaClient.topic.findMany().then((topics) => {
			const choosenTopics: string[] = [];
			const allTopics = topics.map((t) => t.id);
			for (let i = 0; i < 5; i++) {
				let newTopic = pickRandom(allTopics);
				while (choosenTopics.includes(newTopic)) {
					newTopic = pickRandom(allTopics);
				}
				choosenTopics.push(newTopic);
			}
			return choosenTopics;
		});
		const validCreatePostData = {
			title: validTitle,
			description: validDescription,
			difficulty: validDifficulty,
			topics: validTopics
		};
		const testPostPages = jetpack.cwd('tests/blob-storage/mock-post-pages');
		const validPostPages: Blob[] = await Promise.all(
			testPostPages.list()!.map(async (name) => getBlobFromFile(testPostPages, name))
		);

		beforeAll(async () => {
			await Promise.all([prismaClient.post.deleteMany(), blobStorage.clearAll()]);

			testUserId1 = await services.user.create(TEST_USER_1);
			testUserId2 = await services.user.create(TEST_USER_2);

			await services.post.create(testUserId1, validCreatePostData, validPostPages);
		});

		afterAll(async () => {
			await Promise.all([
				prismaClient.user.deleteMany(),
				prismaClient.post.deleteMany(),
				blobStorage.clearAll()
			]);
		});

		test('[SUCCESS] Get Top Authors', async () => {
			const users = await services.user.getTopAuthorsForTopics(validTopics, testUserId1);
			assert(users[0].id === testUserId1);
		});
	});
});
