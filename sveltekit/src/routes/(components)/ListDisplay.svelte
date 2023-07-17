<script lang="ts">
	import type { ResultWithPaging } from '$lib/utils/Paging';
	import { makeRequest } from '../(utils)/makeRequest';
	import Loader from './Loader.svelte';
	import { browser } from '$app/environment';
	import ArrowCircleIcon from '../(assets)/ArrowCircleIcon.svelte';
	import { debounce } from '../(utils)/debounce';

	export let url: string;
	export let pagination: boolean = true;
	export let query: string | null = null;
	export let itemsPerRequest: number = 6;
	export let listComponent: ConstructorOfATypedSvelteComponent;
	export let cl: string = '';
	export let itemsCl: string = '';

	let previousUrl: string | null = null;

	const DEBOUNCE_TIME_MS = 800;

	let itemPages: Array<Array<any>> = [];
	let currentPageIdx: number = 0;
	let previousPageIdx: number | null = null;
	let hasMore = true;
	let isFetchingMore: boolean = true;
	let pagesLeft: number = 0;

	// Fetch next page when {currentPage} is incremented
	$: {
		url;
		// * Reset when URL changes
		if (browser && url !== previousUrl) {
			previousUrl = url;

			currentPageIdx = 0;
			itemPages = [];
			hasMore = true;
			isFetchingMore = false;
			pagesLeft = 0;

			isFetchingMore = true;
			fetchNext();
		}

		// * Fetch next when
		if (
			browser &&
			previousPageIdx !== null &&
			previousPageIdx < currentPageIdx &&
			itemPages[currentPageIdx] === undefined
		) {
			isFetchingMore = true;
			fetchNext();
		}
		previousPageIdx = currentPageIdx;
	}

	const fetchNext = debounce(() => {
		const newUrl = pagination
			? `${url}${!url!.includes('?') ? '?' : '&'}skip=${
					currentPageIdx * itemsPerRequest
			  }&take=${itemsPerRequest}`
			: url;

		makeRequest<ResultWithPaging<any> | Array<any>>(newUrl, undefined, {
			onSuccess(res) {
				if (!pagination) {
					itemPages.push(res as Array<any>);
					itemPages = itemPages;
				} else {
					const resultWithPaging = res as ResultWithPaging<any>;
					if (resultWithPaging.count > 0) {
						// Push new page
						itemPages.push(resultWithPaging.data);
						itemPages = itemPages;
						pagesLeft = resultWithPaging.pagesLeft;
						hasMore = resultWithPaging.hasMore;
					}
				}
				isFetchingMore = false;
			}
		});
	}, DEBOUNCE_TIME_MS);
</script>

<div
	id="list-with-pagination"
	class={`p-6 flex flex-row flex-wrap items-start justify-center gap-2 ${cl}`}
>
	{#if isFetchingMore}
		<Loader cl="w-full !justify-start" />
	{/if}

	{#if !isFetchingMore && itemPages.length === 0}
		<h3>No results found for {query}</h3>
	{/if}

	{#if itemPages[currentPageIdx] !== undefined}
		<div class={`w-screen flex flex-wrap gap-2 ${itemsCl}`}>
			{#each itemPages[currentPageIdx] as item (item.id || item.name)}
				<svelte:component this={listComponent} {item} />
			{/each}
		</div>
	{/if}

	{#if pagination && itemPages.length > 0}
		<div class="w-full flex items-center justify-between p-3 h-40">
			<span>
				{#if currentPageIdx > 0}
					<button
						on:click={() => currentPageIdx--}
						class="flex gap-4 text-xl items-center"
					>
						<span class="fill-orange scale-[200%]">
							<ArrowCircleIcon orientation="l" />
						</span>
					</button>
				{/if}
			</span>

			{#if pagesLeft + itemPages.length > 1}
				<span>
					<span class="font-bold text-xl">{currentPageIdx + 1}</span>
					of
					<span class="font-bold text-xl">{pagesLeft + itemPages.length}</span>
				</span>
			{/if}

			<span>
				{#if currentPageIdx < itemPages.length - 1 || hasMore}
					<button
						on:click={() => currentPageIdx++}
						class="flex gap-4 text-xl items-center"
					>
						<span class="fill-orange scale-[200%]">
							<ArrowCircleIcon orientation="r" />
						</span>
					</button>
				{/if}
			</span>
		</div>
	{/if}
</div>
