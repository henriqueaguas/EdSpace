<script lang="ts">
	import UserImage from './../../(components)/UserImage.svelte';
	import { onMount } from 'svelte';
	import { formatDate } from '../../api/(utils)/formatDate';
	import type { PageData } from './$types';
	import PostPageSelector from './(components)/PostPageSelector.svelte';
	import ShowPostStats from './(components)/ShowPostStats.svelte';
	import { makeRequest } from '../../(utils)/makeRequest';
	import { notify } from '../../(utils)/notify';
	import { capitalizeWord } from '../../(utils)/capitalize';
	import { browser } from '$app/environment';

	export let data: PageData;

	const post = data.post;
	const postPages = post.pages!;

	let followsAuthor: boolean = !!data.followsAuthor;
	let postSaved: boolean = !!data.post.metadata.i_saved;
	let isMyPost: boolean = data.session?.user.id === data.post.metadata.author.id;

	function ratePost(rating: number) {
		makeRequest(
			`/api/posts/${post.metadata.id}/rate`,
			{ method: 'POST', body: { rating: rating } },
			{
				onSuccess() {
					notify.success('Thank you for your feedback', 'top-center');
				}
			}
		);
	}

	function toggleSavePost() {
		const prev = postSaved;
		postSaved = !postSaved;

		makeRequest(
			`/api/me/savedPosts`,
			{ method: prev ? 'DELETE' : 'POST', body: { post_id: data.post.metadata.id } },
			{
				onError() {
					postSaved = prev;
				}
			}
		);
	}

	function toggleFollowAuthor() {
		const prev = followsAuthor;
		followsAuthor = !followsAuthor;
		makeRequest(
			`/api/users/${post.metadata.author.id}/${prev ? 'unfollow' : 'follow'}`,
			{ method: 'POST' },
			{
				onError() {
					followsAuthor = prev;
				}
			}
		);
	}

	onMount(() => {
		if (browser && data.session && !post.metadata.i_read) {
			makeRequest(
				`/api/posts/${post.metadata.id}/view`,
				{ method: 'POST' },
				{ uncaughtErrorStrategy: 'throw' }
			);
		}
	});
</script>

<svelte:head>
	<title>{post.metadata.title}</title>
</svelte:head>

<div class="flex flex-col items-center gap-5 w-[95vw] max-w-[1100px] mb-32">
	<div id="author-info" class="flex flex-col items-center gap-3">
		<UserImage imageLink={post.metadata.author.image} size="small" cl="h-[60px] w-[60px]" />

		<h3 class="font-bold">{post.metadata.author.name}</h3>
		<span class="flex justify-center items-center gap-2">
			{#if !isMyPost}
				{#if followsAuthor}
					<button on:click={toggleFollowAuthor} class="opacity-50 underline text-red-600">
						Unfollow
					</button>
				{:else}
					<button on:click={toggleFollowAuthor} class="text-white opacity-50 underline">
						Follow
					</button>
				{/if}
				<div class="w-1 h-1 bg-orange rounded-full" />
			{/if}
			<a href={`/users/${post.metadata.author.id}`} class="text-white opacity-50 underline"
				>View User Profile</a
			>
		</span>
	</div>

	<hr class="w-[90%] border-2 border-orange opacity-50 rounded-full my-2" />

	<div id="post-metadata" class="flex flex-col items-center gap-2">
		<h2 class="font-extrabold text-center px-2">{post.metadata.title}</h2>

		<span class="font-normal text-white opacity-50"
			>Published at {formatDate(post.metadata.created_at)}</span
		>

		<div id="topics" class="flex flex-col items-center mt-2">
			<ul class="text-center">
				{#each post.metadata.topics as topic}
					<li
						class="text-xs md:text-base mbtn inline-block mx-2 my-1 whitespace-nowrap transition-all hover:-translate-y-1"
					>
						<a href={`/topics/${topic}`}>
							{topic}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		{#if post.metadata.difficulty}
			<div
				id="post-difficulty"
				class="flex items-center justify-center gap-1 text-white text-opacity-60 text-lg mt-2"
			>
				<span class="font-bold">Difficulty Level: </span>
				<span>{capitalizeWord(post.metadata.difficulty)}</span>
			</div>
		{/if}

		{#if post.metadata.description}
			<p class="text-lg md:text-xl text-white text-opacity-75 my-3 w-[80%]">
				{post.metadata.description}
			</p>
		{/if}
	</div>
	<hr class="w-[90%] border-2 border-orange opacity-50 rounded-full my-2" />

	<PostPageSelector pages={postPages} />

	<div
		id="post-bottom-bar"
		class="flex items-center justify-center w-full h-20 fixed bottom-0 border-t-2 border-darkOrange border-opacity-20 bg-darker p-3"
	>
		<ShowPostStats
			isAuthenticated={!!data.session?.user}
			post={post.metadata}
			previousUserRate={post.metadata.i_rated}
			onRate={ratePost}
			userHasSaved={postSaved}
			onSave={toggleSavePost}
		/>
	</div>
</div>
