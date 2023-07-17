<script lang="ts">
	import Loader from './Loader.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { makeRequest } from '../(utils)/makeRequest';
	import { browser } from '$app/environment';
	import ArrowCircleIcon from '../(assets)/ArrowCircleIcon.svelte';
	import { debounce } from '../(utils)/debounce';

	export let url: string;
	export let itemsPerRequest: number = 15;
	export let listComponent: ConstructorOfATypedSvelteComponent;
	export let cl: string = '';
	export let transformItems: (items: Array<any>, newItems: Array<any>) => Array<any> = (i, p) => [
		...i,
		...p
	];
	// If when received is not empty it will only fetch more on scroll. Otherwise an initial fetch will happen
	export let items: Array<any> = [];

	export let k: number = 0;
	export let onNewItems: (key: number, items: Array<any>) => void = () => {};

	const SHOW_ARROW_UP_TRESHOLD = 4;

	let currentPage = -1;
	let isFetchingMore: boolean = items.length === 0;

	function fetchNext() {
		currentPage++;

		const newUrl = `${url}${!url.includes('?') ? '?' : '&'}skip=${
			currentPage * itemsPerRequest
		}&take=${itemsPerRequest}`;

		makeRequest<Array<any>>(newUrl, undefined, {
			onSuccess(newResults) {
				isFetchingMore = false;
				items = transformItems(items, newResults);
				onNewItems(k, items);
			}
		});
	}

	// Will fetch more items when the scroll reaches 80% of the list
	const handleScroll = debounce(() => {
		if (isFetchingMore) return;
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
			currentPage = items.length / itemsPerRequest;
		}
	});

	onDestroy(() => {
		if (!browser) return;

		document.removeEventListener('scroll', handleScroll);
	});
</script>

<ul
	id="infinite-scroll"
	class={`relative w-[95vw] p-6 flex flex-wrap justify-center items-center gap-3 pb-20 ${cl}`}
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
