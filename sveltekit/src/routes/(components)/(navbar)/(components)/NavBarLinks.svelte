<script lang="ts">
	import { page } from '$app/stores';
	import SearchBar from './SearchBar.svelte';
	import { goto } from '$app/navigation';
	import { LogicConstraints } from '$lib/services/constraints';
	import Icon from '../../../(assets)/Icon.svelte';
	import SearchIcon from '../../../(assets)/SearchIcon.svelte';

	export let isOnSideBar: boolean;
	export let onNavigate: () => void = () => {};

	$: route = $page.route.id;

	let showSearchBar: boolean = (isOnSideBar && route !== '/search') || false;

	let linksFontSize = isOnSideBar ? 'text-2xl' : '';
	let iconsSize = isOnSideBar ? '38px' : '24px';
</script>

{#if showSearchBar}
	<span class={`flex ${isOnSideBar ? 'mb-6 mx-3' : 'max-w-[600px] w-[80%]'}`}>
		<SearchBar
			cl="w-full h-full absolute"
			onSearch={(query) => {
				goto(`/search?q=${query}`);
				showSearchBar = false;
				onNavigate();
			}}
			maxChars={LogicConstraints.Searches.max_chars}
		/>
		{#if !isOnSideBar}
			<button
				class="fill-orange opacity-60 ml-3 scale-150 flex items-center"
				on:click={() => (showSearchBar = false)}
			>
				<Icon name="XCircle" />
			</button>
		{/if}
	</span>
{/if}
{#if isOnSideBar || !showSearchBar}
	<ul
		class={`flex ${
			isOnSideBar ? 'flex-col gap-7' : 'flex-row gap-2'
		} items-center justify-center`}
	>
		{#if isOnSideBar}
			<a
				class={`transition-opacity hover:opacity-100 ${
					route === '/' ? 'opacity-100' : 'opacity-80'
				}`}
				href="/"
				on:click={onNavigate}
			>
				<li
					class={`${linksFontSize} truncate font-bold flex gap-[5px] items-center lg:text-xl`}
				>
					<Icon name="Home" />
					<span>Home</span>
				</li>
			</a>
		{/if}
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<a
			class={`transition-opacity hover:opacity-100 ${
				route === '/myfeeds' ? 'opacity-100' : 'opacity-80'
			}`}
			href="/myfeeds"
			on:click={onNavigate}
		>
			<li
				class={`${linksFontSize} truncate font-bold flex gap-[5px] items-center lg:text-xl`}
			>
				<Icon name="Rss" cl="pb-1" />
				<span>My Feeds</span>
			</li>
		</a>

		{#if !isOnSideBar}
			<hr class="h-1 rounded-full w-1 bg-orange border-none opacity-50" />
		{/if}
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<a
			class={`transition-opacity hover:opacity-100 ${
				route === '/posts/trending' ? 'opacity-100' : 'opacity-80'
			}`}
			href="/posts/trending"
			on:click={onNavigate}
		>
			<li
				class={`${linksFontSize} truncate font-bold flex gap-[2px] items-center lg:text-xl`}
			>
				<Icon name="Flame" cl="pb-1" />
				<span>Trending</span>
			</li>
		</a>

		{#if !isOnSideBar}
			<hr class="h-1 rounded-full w-1 bg-orange border-none opacity-50" />
		{/if}

		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<a
			class={`transition-opacity hover:opacity-100 ${
				route === '/users/ranking' ? 'opacity-100' : 'opacity-80'
			}`}
			href="/users/ranking"
			on:click={onNavigate}
		>
			<li
				class={`${linksFontSize} truncate font-bold flex gap-[6px] items-center lg:text-xl hover:opacity-100`}
			>
				<Icon name="Crown" cl="pb-1" />
				<span> Ranking </span>
			</li>
		</a>

		{#if !isOnSideBar && route != '/search'}
			<hr class="h-1 rounded-full w-1 bg-orange border-none opacity-50" />
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<li
				on:click={() => (showSearchBar = true)}
				class="transition-opacity font-bold flex gap-[4px] items-center cursor-pointer truncate lg:text-xl opacity-80 hover:opacity-100"
			>
				<span class={`fill-orange ${iconsSize} pb-1`}>
					<SearchIcon />
				</span>
				<span>Search</span>
			</li>
		{/if}
	</ul>
{/if}
