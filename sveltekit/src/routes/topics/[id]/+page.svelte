<script lang="ts">
	import ListWithPagination from '../../(components)/ListDisplay.svelte';
	import PostMetadataDisplay from './../../(components)/PostMetadataDisplay.svelte';
	import type { PageData } from './$types';
	import { makeRequest } from '../../(utils)/makeRequest';
	import TopicsAuthorDisplay from '../../(components)/TopicsAuthorDisplay.svelte';
	import InfiniteScroll from '../../(components)/InfiniteScroll.svelte';

	export let data: PageData;

	$: am_i_following = data.topic.am_i_following;

	function toggleFollowTopic() {
		const prev = am_i_following;
		am_i_following = !am_i_following;

		makeRequest(
			`/api/topics/${data.topic.id}/${prev ? 'unfollow' : 'follow'}`,
			{ method: 'POST' },
			{
				onError() {
					// Restore to previous state
					am_i_following = prev;
				}
			}
		);
	}
</script>

<svelte:head>
	<title>Topics | {data.topic.id}</title>
</svelte:head>

<div
	class="max-w-[900px] w-[90vw] flex flex-col items-center justify-center gap-1 bg-darkOrange text-darker py-10 rounded-lg shadow-lg"
>
	<h2>{data.topic.id}</h2>
	<div class="flex items-center justify-center gap-3">
		<span class="text-xl xl:text-2xl">{data.topic.followers_count} Followers</span>
		<div class="w-1 h-1 bg-dark rounded-full" />
		<span class="text-xl xl:text-2xl">{data.topic.posts_count} Posts</span>
	</div>

	{#if data.session !== null}
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<button
			on:click={toggleFollowTopic}
			class={`mbtn text-lg xl:text-xl mt-2 px-12 md:px-20 transition-all hover:-translate-y-[2px] ${
				am_i_following
					? 'border-dark bg-darkOrange text-dark'
					: 'border-dark bg-dark text-darkOrange'
			}`}
		>
			{#if am_i_following}
				Already Following
			{:else}
				Follow
			{/if}
		</button>
	{/if}
</div>

{#if data.topic.posts_count === 0}
	<h3 class="my-20 text-white text-opacity-70">
		No one has posted on {data.topic.id} yet
	</h3>
{:else}
	<div class=" flex flex-col items-center gap-5 mt-2">
		<h4 class="text-white text-opacity-70">Top Rated Authors</h4>
		<ListWithPagination
			url={`/api/topics/${data.topic.id}/topAuthors`}
			listComponent={TopicsAuthorDisplay}
			cl="border-orange bg-darkOrange rounded-md pb-10 bg-opacity-10 max-w-[900px] w-[90vw] !min-h-[190px] !max-h-[190px] overflow-y-hidden border-y-4 items-center justify-center"
			itemsCl="flex-nowrap justify-start"
			pagination={false}
		/>
	</div>

	<div class=" flex flex-col items-center gap-5 mt-6">
		<h4 class="text-white text-opacity-70">Posts published on this topic</h4>
		<InfiniteScroll
			url={`/api/posts?hasTopics=${data.topic.id}`}
			listComponent={PostMetadataDisplay}
			itemsPerRequest={15}
		/>
	</div>
{/if}
