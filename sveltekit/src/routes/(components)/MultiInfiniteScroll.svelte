<script lang="ts">
	import InfiniteScroll from './InfiniteScroll.svelte';

	type ListRepresentation = {
		name: string;
		listComponentArgs: {
			url: string;
			itemsPerRequest?: number;
			listComponent: ConstructorOfATypedSvelteComponent;
			cl?: string;
		};
	};
	export let lists: Array<ListRepresentation | undefined>;
	export let cl: string = '';

	$: cleanLists = lists.filter((it) => it !== undefined) as Array<ListRepresentation>;

	let focusedListIndex = 0;
	// To avoid making requests for data the user already had
	let listsPreviousContent: Array<Array<any>> = [];
</script>

<div class={`${cl}`}>
	<ul id="list-names" class="flex items-center w-full justify-center flex-wrap gap-5">
		{#each cleanLists as list, index}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<li
				class={`text-lg md:text-xl text-white font-bold underline-offset-4 cursor-pointer ${
					focusedListIndex === index ? 'underline text-opacity-70' : 'text-opacity-50'
				}`}
				on:click={() => (focusedListIndex = index)}
			>
				{list.name}
			</li>
		{/each}
	</ul>

	<div id="current-list-container" class="flex">
		{#key focusedListIndex}
			<svelte:component
				this={InfiniteScroll}
				{...cleanLists[focusedListIndex].listComponentArgs}
				k={focusedListIndex}
				items={listsPreviousContent[focusedListIndex] || []}
				onNewItems={(key, items) => {
					// If the user clicks fetches data from an old callback it will get stored in the proper place
					// instead of the current focused list. This way we don't throw data away
					listsPreviousContent[key] = items;
				}}
			/>
		{/key}
	</div>
</div>
