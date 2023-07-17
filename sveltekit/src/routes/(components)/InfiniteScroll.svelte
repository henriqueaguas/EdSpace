<script lang="ts">
	import Loader from './Loader.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { makeRequest } from '../(utils)/makeRequest';
	import type { ResultWithPaging } from '$lib/utils/Paging';
	import { browser } from '$app/environment';
	import ArrowCircleIcon from '../(assets)/ArrowCircleIcon.svelte';
	import { debounce } from '../(utils)/debounce';

	export let url: string;
	export let itemsPerRequest: number = 15;
	export let listComponent: ConstructorOfATypedSvelteComponent;
	export let cl: string = '';
	// If when received is not empty it will only fetch more on scroll. Otherwise an initial fetch will happen
	export let items: Array<any> = [];

	export let k: number = 0;
	export let onNewItems: (
		key: number,
		items: Array<any>,
		isFirstFetch: boolean
	) => void = () => {};

	const SHOW_ARROW_UP_TRESHOLD = 2;

	let currentPage = -1;
	let hasMore = true;
	let isFetchingMore: boolean = items.length === 0;

	function fetchNext() {
		isFetchingMore = true;
		currentPage++;

		const newUrl = `${url}${!url.includes('?') ? '?' : '&'}skip=${
			currentPage * itemsPerRequest
		}&take=${itemsPerRequest}`;

		makeRequest<ResultWithPaging<any>>(newUrl, undefined, {
			onSuccess(res) {
				items = [...items, ...res.data];

				isFetchingMore = false;
				hasMore = res.hasMore;

				onNewItems(k, items, currentPage === 0);
			}
		});
	}

	// Will fetch more items when the scroll reaches 80% of the list
	const handleScroll = debounce(() => {
		if (isFetchingMore) return;
		if (!hasMore) {
			document.removeEventListener('scroll', handleScroll);
			return;
		}
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;
		const scrollPosition = window.scrollY;

		if (scrollPosition >= (documentHeight - windowHeight) * 0.8) {
			fetchNext();
		}
	}, 100);

	onMount(() => {
		if (!browser) return;

		document.addEventListener('scroll', handleScroll);

		if (items.length === 0) {
			isFetchingMore = true;
			fetchNext();
		} else {
			// Already received data and there should not be more
			if ((items.length / itemsPerRequest) % 1 !== 0) {
				hasMore = false;
			} else {
				currentPage = items.length / itemsPerRequest;
			}
		}
	});

	onDestroy(() => {
		if (!browser) return;

		document.removeEventListener('scroll', handleScroll);
	});
</script>

<ul
	id="infinite-scroll"
	class={`relative max-w-[800px] w-screen p-6 flex flex-col items-center gap-3 pb-20 ${cl}`}
>
	{#each items as item}
		<svelte:component this={listComponent} {item} />
	{/each}
	{#if isFetchingMore}
		<Loader />
	{:else if items.length === 0}
		<h5 class="text-white text-opacity-50">No results found</h5>
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
		{#if items.length > SHOW_ARROW_UP_TRESHOLD}
			<ArrowCircleIcon orientation="t" />
		{/if}
	</span>
</ul>
