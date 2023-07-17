<script lang="ts">
	import { onMount } from 'svelte';
	import SearchIcon from '../../../(assets)/SearchIcon.svelte';

	export let cl: string = '';
	export let onSearch: (value: string) => void = () => {};
	export let searchValue: string = '';
	export let focused: boolean = true;
	export let maxChars: number | undefined = undefined;
	export let hideButton: boolean = false;

	let inputElem: HTMLElement;

	$: {
		searchValue;

		if (focused) setTimeout(() => inputElem?.focus(), 5);
	}

	function search() {
		if (searchValue.length === 0) return;
		onSearch(searchValue);
	}

	onMount(() => {
		inputElem.focus();
	});
</script>

<div id="search-bar" class={`relative flex items-center ${cl}`}>
	<span class="fill-white opacity-20 left-3 absolute pb-[2px]">
		<SearchIcon />
	</span>

	<input
		bind:this={inputElem}
		bind:value={searchValue}
		on:keydown={(e) => {
			if (e.key === 'Enter') search();
		}}
		maxlength={maxChars}
		type="text"
		class="input-border border-opacity-70 w-full h-12 pb-3 pl-12 placeholder:text-sm sm:placeholder:text-lg"
		placeholder="Posts, users and topics"
	/>

	{#if !hideButton}
		<!-- content here -->
		<button
			on:click={search}
			class="absolute right-2 h-8 text-dark px-1 sm:px-4 opacity-90 bg-orange rounded-sm font-bold transition-all hover:scale-[103%] hover:opacity-100 text-xs sm:text-sm"
		>
			SEARCH
		</button>
	{/if}
</div>
