<script lang="ts">
	import UserImage from './UserImage.svelte';
	import type { ResultWithPaging } from '$lib/utils/Paging';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { makeRequest } from '../(utils)/makeRequest';
	import { v4 as generateUUID } from 'uuid';
	import { onClickedOutside } from '../(utils)/onClickedOutside';
	import Icon from '../(assets)/Icon.svelte';
	import { debounce } from '../(utils)/debounce';

	const dispatch = createEventDispatcher();

	export let onUserSelected: (user: tuser.UserPublicStats) => void;
	export let selectedUsers: tuser.UserPublicStats[];
	export let cl: string = '';
	export let parentCl: string = '';

	const TAKE = 10;
	const DEBOUNCE_TIME_MS = 500;

	let searchValue: string = '';
	let prevSearchValue: string | null = null;

	let resultPages: Array<tuser.UserPublicStats[]> = [];

	// Different results from {selectedTopics}
	$: resultsToShow = resultPages
		.map((rp) => rp.filter((u) => !selectedUsers.find((su) => su.id === u.id)))
		.filter((rp) => rp.length !== 0);

	let hasMore: boolean = false;
	let currentPageIdx: number = 0;

	let currentRequest: string | null = null;

	let inputElement: any;

	const getFirstResultsPage = debounce(async () => {
		if (searchValue === prevSearchValue) {
			return;
		} else {
			prevSearchValue = searchValue;
		}
		// Reset things
		resultPages = [];
		hasMore = false;
		currentPageIdx = 0;

		if (searchValue.length === 0) return;

		const myRequest = generateUUID();
		currentRequest = myRequest;

		const response = await search(0);

		// If no request was made after this one the results are valid
		if (currentRequest === myRequest) {
			// 1st page of a new search
			if (response.count > 0) resultPages = [response.data];
		}
	}, DEBOUNCE_TIME_MS);

	function gotoPreviousPage() {
		currentPageIdx--;
	}

	async function gotoNextPage() {
		// If we don't have the pagettopiclts yet
		if (!resultPages[currentPageIdx + 1]) {
			const response = await search(currentPageIdx + 1);
			resultPages = [...resultPages, response.data];
		}
		// Increment in both cases
		currentPageIdx++;
	}

	const search = async (page: number) =>
		new Promise<ResultWithPaging<tuser.UserPublicStats>>((resolve, _) => {
			makeRequest(`/api/users?q=${searchValue}&skip=${page * TAKE}&take=${TAKE}`, undefined, {
				onSuccess(response) {
					hasMore = response.hasMore;
					resolve(response);
				},
				uncaughtErrorStrategy: 'notify'
			});
		});

	let userResultsElem: HTMLElement;
	let removeClickedOutsideEvent: () => void = () => {};

	$: {
		if (resultPages.length > 0) {
			removeClickedOutsideEvent();

			// Hide topic search box when click outside it
			removeClickedOutsideEvent = onClickedOutside(userResultsElem, () => {
				resultPages = [];
			});
		}
	}

	onMount(() => {
		inputElement.focus();
	});

	onDestroy(() => {
		removeClickedOutsideEvent();
	});
</script>

<div class={`relative ${parentCl}`}>
	<input
		bind:this={inputElement}
		id="search-topic-input"
		on:keyup={getFirstResultsPage}
		on:keydown={(e) => (e.code === 'Escape' ? dispatch('hide') : null)}
		class={`input-border w-full ${cl}`}
		bind:value={searchValue}
		type="text"
	/>

	{#if resultsToShow.length > 0}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<ul
			bind:this={userResultsElem}
			id="topic-results"
			class="absolute border-2 border-orange border-opacity-30 min-w-full z-10"
		>
			{#if hasMore || currentPageIdx > 0 || currentPageIdx < resultsToShow.length - 1}
				<span class="flex items-center justify-between px-4 py-2 bg-dark">
					<span>
						{#if currentPageIdx > 0}
							<button on:click={gotoPreviousPage}><Icon name="ChevronLeft" /></button>
						{/if}
					</span>
					<span>
						{#if hasMore || currentPageIdx < resultsToShow.length - 1}
							<button on:click={gotoNextPage}><Icon name="ChevronRight" /></button>
						{/if}
					</span>
				</span>
			{/if}
			{#each resultsToShow[currentPageIdx] as user}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<li
					class={'flex items-center justify-start gap-2 cursor-pointer whitespace-nowrap w-auto px-2 py-2 bg-dark text-base md:text-xl'}
					on:mousedown={() => onUserSelected(user)}
				>
					<UserImage imageLink={user.image} size="micro" />
					<span>
						{user.name}
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>
