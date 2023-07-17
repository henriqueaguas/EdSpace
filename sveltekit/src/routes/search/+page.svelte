<script lang="ts">
	import Selector from './../(components)/Selector.svelte';
	import TopicSelector from './../(components)/TopicSelector.svelte';
	import ListWithPagination from '../(components)/ListDisplay.svelte';
	import SearchBar from './../(components)/(navbar)/(components)/SearchBar.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import PostMetadataDisplay from '../(components)/PostMetadataDisplay.svelte';
	import { capitalizeWord } from '../(utils)/capitalize';
	import TopicDisplay from '../(components)/TopicDisplay.svelte';
	import { LogicConstraints } from '$lib/services/constraints';
	import UserDisplay from '../(components)/UserDisplay.svelte';
	import Icon from '../(assets)/Icon.svelte';

	type Query = {
		q?: string;
		col?: string;
		difficulty?: string;
		hasTopics?: string;
	};

	type Collection = (typeof possibleCollections)[number];

	const sp = Object.fromEntries(new URLSearchParams(window.location.search)) as Query;

	let query: string = sp.q || '';
	let collection = (sp.col || 'posts') as Collection;
	let filterDifficulty = (sp.difficulty || null) as tpost.Difficulty;
	let filterTopics: string[] = sp.hasTopics?.split(',') || [];

	const possibleCollections = ['users', 'posts', 'topics'] as const;
	const difficultyOptions = LogicConstraints.Posts.POSSIBLE_DIFFICULTIES.map((d) => ({
		label: !d ? 'Not Specified' : capitalizeWord(d),
		value: d
	}));

	$: APIendpoint = () => {
		/** Filter Effect
		 * 	 Update query string when filters change
		 * */
		let updatedSearchParams: string = '';
		modifySearch((s) => {
			s.set('q', query);
			s.set('col', collection);

			if (filterTopics.length === 0) {
				s.delete('hasTopics');
			} else {
				s.set('hasTopics', filterTopics.join(','));
			}

			if (filterDifficulty === null) {
				s.delete('difficulty');
			} else {
				s.set('difficulty', filterDifficulty?.toString() || 'null');
			}

			updatedSearchParams = s.toString();
		});

		return `/api/${collection}?${updatedSearchParams}`;
	};

	function removeTopic(topic: string) {
		filterTopics.splice(filterTopics.indexOf(topic), 1);
		filterTopics = filterTopics;
	}

	function addTopic(newTopic: string) {
		filterTopics = [...filterTopics, newTopic];
	}

	function modifySearch(block: (modifyableSearch: URLSearchParams) => void) {
		const newSearch = new URLSearchParams($page.url.searchParams);
		block(newSearch);
		goto(`/search?${newSearch.toString()}`, {
			state: window.history.state
		});
	}
</script>

<svelte:head>
	<title>Search</title>
</svelte:head>

<div class="max-w-[1100px] w-[90vw] h-full flex flex-col items-center justify-start gap-6">
	<h2>Search</h2>

	<div
		class="max-w-[800px] w-[90vw] flex-col items-center justify-center bg-orange bg-opacity-90 px-2 md:px-6 py-4 md:py-8 text-dark rounded-lg"
	>
		<SearchBar
			cl={'w-full'}
			bind:searchValue={query}
			maxChars={LogicConstraints.Searches.max_chars}
			hideButton={true}
		/>

		{#if collection === 'posts'}
			<hr class="mt-4 mb-2 border-dark border-[1px] rounded-full" />

			<div id="filters" class="flex items-start justify-around">
				<div
					id="difficulty-filter"
					class="flex flex-col items-center justify-start w-40 gap-1 h-24 py-2"
				>
					<label for="select" class="text-xl font-bold text-dark">Difficulty</label>
					<Selector options={difficultyOptions} bind:selectedOption={filterDifficulty} />
				</div>

				<div
					id="topic-selector"
					class="text-orange flex flex-col items-center justify-start gap-1 py-2 max-w-[400px]"
				>
					<label for="topic-selector" class="text-xl font-bold text-dark">Topics</label>
					<TopicSelector
						selectedTopics={filterTopics}
						onTopicSelected={addTopic}
						cl="h-[47px]"
					/>

					<ul
						id="selected-topics"
						class="flex items-center justify-center gap-2 flex-wrap max-w-full"
					>
						{#each filterTopics as topic}
							<li
								class="text-xs md:text-base bg-dark whitespace-nowrap text-orange py-1 px-3 rounded-xl font-bold w-fit flex items-center justify-center gap-1"
							>
								{topic}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<span
									on:click={() => removeTopic(topic)}
									class="cursor-pointer transition-all hover:scale-110 fill-orange"
								>
									<Icon name="X" />
								</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>

	<ul class="flex items-center justify-center gap-[15%]">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<li
			on:click={() => (collection = 'posts')}
			class={`text-xl font-bold text-opacity-90 underline-offset-4 cursor-pointer ${
				collection === 'posts' ? 'underline scale-105' : 'opacity-70'
			}`}
		>
			Posts
		</li>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<li
			on:click={() => (collection = 'users')}
			class={`text-xl font-bold text-opacity-90 underline-offset-4 cursor-pointer ${
				collection === 'users' ? 'underline scale-105' : 'opacity-70'
			}`}
		>
			Users
		</li>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<li
			on:click={() => (collection = 'topics')}
			class={`text-xl font-bold text-opacity-90 underline-offset-4 cursor-pointer ${
				collection === 'topics' ? 'underline scale-105' : 'opacity-70'
			}`}
		>
			Topics
		</li>
	</ul>

	<div id="search-results">
		{#if query !== ''}
			{#if collection === 'posts'}
				<ListWithPagination
					url={APIendpoint()}
					listComponent={PostMetadataDisplay}
					{query}
					cl="max-w-[85vw] w-[90vw] min-h-[600px]"
					itemsCl="justify-center"
				/>
			{:else if collection === 'users'}
				<ListWithPagination
					url={APIendpoint()}
					listComponent={UserDisplay}
					itemsPerRequest={15}
					{query}
					cl="max-w-[800px] w-[90vw] min-h-[600px]"
					itemsCl="justify-center"
				/>
			{:else if collection === 'topics'}
				<ListWithPagination
					url={APIendpoint()}
					listComponent={TopicDisplay}
					itemsPerRequest={15}
					{query}
					cl="max-w-[100vw] md:w-[85vw] min-h-[600px]"
					itemsCl="justify-center"
				/>
			{/if}
		{/if}
	</div>
</div>
