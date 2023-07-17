<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '../../../(assets)/Icon.svelte';
	import { formatNumber } from '../../../api/(utils)/formatDate';
	import SharePostOptions from './SharePostOptions.svelte';

	export let isAuthenticated: boolean;
	export let post: tpost.PostStats;

	export let previousUserRate: number | null;
	export let onRate: (rating: number) => void;

	export let userHasSaved: boolean;
	export let onSave: () => void;

	let firstRender = true;

	let rating: number = previousUserRate !== null ? previousUserRate : 0;
	let showShareOptions = false;

	$: {
		if (!firstRender && rating != 0 && typeof window !== 'undefined') {
			onRate(rating);
		}
		firstRender = false;
	}
</script>

<div class="text-orange flex md:gap-10 items-center justify-around m-2 h-full">
	<div id="stats" class="flex md:gap-4">
		{#if post.views_count}
			<span class="flex flex-col items-center justify-end gap-1 md:gap-2">
				<Icon name="Eye" cl="md:scale-125" />
				<span class="font-bold text-sm md:text-base">{formatNumber(post.views_count)}</span>
			</span>
		{/if}

		{#if $page.data.session?.user.id !== post.author.id}
			<span class="flex flex-col items-center">
				<div class="rating rating-lg scale-[65%] md:scale-75">
					<input type="radio" name="rating-9" class="rating-hidden" checked />
					<input
						bind:group={rating}
						value={1}
						type="radio"
						name="rating-9"
						class="bg-orange mask mask-star-2"
					/>
					<input
						bind:group={rating}
						value={2}
						type="radio"
						name="rating-9"
						class="bg-orange mask mask-star-2"
					/>
					<input
						bind:group={rating}
						value={3}
						type="radio"
						name="rating-9"
						class="bg-orange mask mask-star-2"
					/>
					<input
						bind:group={rating}
						value={4}
						type="radio"
						name="rating-9"
						class="bg-orange mask mask-star-2"
					/>
					<input
						bind:group={rating}
						value={5}
						type="radio"
						name="rating-9"
						class="bg-orange mask mask-star-2"
					/>
				</div>

				{#if post.avg_rating && post.rates_count}
					<span class="flex gap-2 items-center">
						<span class="font-bold text-xs md:text-base">{post.avg_rating}/5.0</span>
						<span class="text-xs md:text-sm"
							>(rated by {formatNumber(post.rates_count)} users)</span
						>
					</span>
				{:else}
					<span> No ratings yet </span>
				{/if}
			</span>
		{/if}
	</div>

	<div id="actions" class="relative flex gap-4 justify-center items-start">
		{#if showShareOptions}
			<SharePostOptions
				postTitle={post.title}
				postAuthorName={post.author.name}
				onClose={() => (showShareOptions = false)}
			/>
		{/if}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span
			on:click={() => (showShareOptions = !showShareOptions)}
			class="relative cursor-pointer flex flex-col items-center gap-2"
		>
			<Icon name="Share2" cl="md:scale-125" />
			<div class="flex flex-col">
				<span class="font-bold text-sm md:text-base hidden md:block">Share</span>
			</div>
		</span>

		{#if isAuthenticated}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<span
				on:click={onSave}
				class="cursor-pointer hover:opacity-100 opacity-90 flex flex-col items-center gap-2"
			>
				{#if userHasSaved}
					<Icon name="BookmarkMinus" cl="md:scale-125" />
				{:else}
					<Icon name="BookmarkPlus" cl="md:scale-125" />
				{/if}
				<div class="flex flex-col ">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span class="font-bold text-sm md:text-base hidden md:block">
						{#if userHasSaved}
							Remove from Saved
						{:else}
							Save Post
						{/if}
					</span>
				</div>
			</span>
		{/if}
	</div>
</div>
