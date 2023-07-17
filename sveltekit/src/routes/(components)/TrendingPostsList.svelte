<script lang="ts">
	import Loader from './Loader.svelte';
	import { onMount } from 'svelte';
	import { makeRequest } from '../(utils)/makeRequest';
	import { browser } from '$app/environment';
	import ArrowCircleIcon from '../(assets)/ArrowCircleIcon.svelte';
	import PostMetadataDisplay from './PostMetadataDisplay.svelte';

	export let url: string;
	export let cl: string = '';
	// If when received is not empty it will only fetch more on scroll. Otherwise an initial fetch will happen
	let posts: Array<tpost.PostStats> | null = null;

	const SHOW_ARROW_UP_TRESHOLD = 4;

	onMount(() => {
		if (!browser) return;

		makeRequest<Array<tpost.PostStats>>(url, undefined, {
			onSuccess(res) {
				posts = res;
			}
		});
	});
</script>

<ul
	id="trending-posts"
	class={`relative w-[95vw] p-6 flex flex-wrap justify-center items-start gap-3 pb-20 ${cl}`}
>
	{#if !posts}
		<Loader />
	{:else if posts && posts.length === 0}
		<h5>No Trending Posts found in this period</h5>
	{:else}
		{#each posts as post}
			<PostMetadataDisplay item={post} />
		{/each}
	{/if}

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span
		class="fixed right-[50%] bottom-5 fill-orange opacity-90 scale-[200%] cursor-pointer transition-all hover:scale-[210%]"
		on:click={() => {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}}
	>
		{#if posts && posts.length > SHOW_ARROW_UP_TRESHOLD}
			<ArrowCircleIcon orientation="t" />
		{/if}
	</span>
</ul>
