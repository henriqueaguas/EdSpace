<script lang="ts">
	import EditFeedModal from './(components)/EditFeedModal.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Loader } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import Icon from '../(assets)/Icon.svelte';
	import InfiniteFeed from '../(components)/InfiniteFeed.svelte';
	import { makeRequest } from '../(utils)/makeRequest';
	import PostMetadataDisplay from '../(components)/PostMetadataDisplay.svelte';
	import CreateFeedModal from './(components)/CreateFeedModal.svelte';
	import PostSignUpProcess from '../(components)/PostSignUpProcess.svelte';

	$: session = $page.data.session;

	let selectedFeedId: 'home' | string = $page.url.searchParams.get('feedId') || 'home';
	let userFeeds: tfeed.Feed[] | null = null;

	let showCreateFeedModal = false;
	let showEditModal = false;

	function feedClass(feedId: typeof selectedFeedId) {
		let cl = '';
		if (selectedFeedId === feedId) cl = 'bg-orange text-darker rounded-t-md';
		else cl = 'bg-dark text-orange';
		return `border-b-2 border-orange px-4 py-2 flex items-center justify-center gap-1 cursor-pointer font-bold ${cl}`;
	}

	function openFeedEditor() {
		showEditModal = true;
	}

	function openFeedCreator() {
		showCreateFeedModal = true;
	}

	let refreshFeedFlag = false;

	function onFeedCreated(feed: tfeed.Feed) {
		userFeeds?.push(feed);
		// userFeeds = userFeeds;
		selectFeed(feed.id);
	}

	function selectFeed(feedId: 'home' | string) {
		selectedFeedId = feedId;
		$page.url.searchParams.set('feedId', feedId);
		goto($page.url);
	}

	function updateFeedDetails(
		args:
			| {
					events: Array<'change_name' | 'change_topics_or_authors'>;
					updatedFeed: svct.outputs.feed.Update;
			  }
			| { events: 'deleted' }
	) {
		const feeds = userFeeds;
		if (!feeds) return;
		const feedIdx = feeds.findIndex((f) => f.id === selectedFeedId);
		const feed = feeds[feedIdx];
		if (feedIdx === -1) return;

		if (args.events == 'deleted') {
			feeds.splice(feedIdx, 1);
			if (feed.id === selectedFeedId) selectedFeedId = 'home';
			userFeeds = userFeeds;
		} else {
			if (args.events.includes('change_name')) {
				feed.name = args.updatedFeed.feed.name;
				userFeeds = userFeeds;
			}
			if (args.events.includes('change_topics_or_authors')) {
				refreshFeedFlag = !refreshFeedFlag;
			}
		}
	}

	let feedBeingDragged: string | null = null;

	function handleDragStart(event: any, feedId: string) {
		feedBeingDragged = feedId;
		event.dataTransfer.setData('text/plain', feedId);
	}

	function handleDragEnd() {
		feedBeingDragged = null;
	}

	function handleDragDrop(event: any, secondFeedId: string) {
		event.preventDefault();

		if (!userFeeds) return;

		const firstFeedId = event.dataTransfer.getData('text/plain');

		if (firstFeedId === secondFeedId) return;

		const firstFeedIdx = userFeeds.findIndex((feed) => feed.id === firstFeedId);
		const secondFeedIdx = userFeeds.findIndex((feed) => feed.id === secondFeedId);

		// swap indexes
		if (firstFeedIdx === -1 || secondFeedIdx === -1) {
			return;
		}

		[userFeeds[firstFeedIdx], userFeeds[secondFeedIdx]] = [
			userFeeds[secondFeedIdx],
			userFeeds[firstFeedIdx]
		];
		userFeeds = userFeeds;
		feedBeingDragged = null;

		makeRequest(
			`/api/feeds/${firstFeedId}/swap`,
			{
				method: 'POST',
				body: {
					otherFeedId: secondFeedId
				}
			},
			{
				onError() {
					// undo optimistic swap

					if (!userFeeds) return;
					if (firstFeedIdx !== -1 && secondFeedIdx !== -1) {
						[userFeeds[firstFeedIdx], userFeeds[secondFeedIdx]] = [
							userFeeds[secondFeedIdx],
							userFeeds[firstFeedIdx]
						];
						userFeeds = userFeeds;
					}
				}
			}
		);
	}
	let showPostSignUpProcess = false;

	onMount(() => {
		makeRequest<tfeed.Feed[]>('/api/feeds', undefined, {
			onSuccess(res) {
				userFeeds = res;
			}
		});

		if (!session) return;

		makeRequest<boolean>(
			'/api/me/signupCompleted',
			{ method: 'GET' },
			{
				onSuccess(hasCompleted) {
					if (!hasCompleted) showPostSignUpProcess = true;
				}
			}
		);
	});
</script>

<svelte:head>
	<title>My Feeds</title>
</svelte:head>

{#if showCreateFeedModal}
	<CreateFeedModal {onFeedCreated} onClose={() => (showCreateFeedModal = false)} />
{/if}

{#if showEditModal}
	<EditFeedModal
		feedId={selectedFeedId}
		onFeedUpdated={updateFeedDetails}
		onClose={() => (showEditModal = false)}
	/>
{/if}

<h2 class="mb-6">My Feeds</h2>

<div class="flex justify-center w-full">
	<ul class="flex items-center justify-start flex-wrap max-w-[90%] ">
		{#key selectedFeedId}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<li on:click={() => selectFeed('home')} class={feedClass('home')}>Home Feed</li>
			{#if userFeeds}
				{#each userFeeds as feed (feed.id)}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<li
						id={feed.id}
						draggable="true"
						on:dragstart={(e) => handleDragStart(e, feed.id)}
						on:dragover={(e) => e.preventDefault()}
						on:drop={(e) => handleDragDrop(e, feed.id)}
						on:dragend={handleDragEnd}
						on:click={() => selectFeed(feed.id)}
						class="{`${feedClass(feed.id)} ${
							feedBeingDragged === feed.id ? 'scale-125' : ''
						}`}s"
					>
						{#if selectedFeedId === feed.id}
							<Icon name="GripVertical" cl="scale-75" />
						{/if}
						{feed.name}
						{#if selectedFeedId === feed.id}
							<span on:click={() => openFeedEditor()}>
								<Icon name="Pencil" cl="scale-[95%] pb-1" />
							</span>
						{/if}
					</li>
				{/each}
			{:else}
				<Loader />
			{/if}
		{/key}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<li
			class="px-4 py-2 flex items-center justify-center gap-1 cursor-pointer font-bold bg-dark text-orange"
		>
			<Icon
				on:click={openFeedCreator}
				name="PlusSquare"
				parentCl="ml-3 cursor-pointer"
				cl="scale-125"
			/>
		</li>
	</ul>
</div>

{#if showPostSignUpProcess}
	<PostSignUpProcess onClose={() => (showPostSignUpProcess = false)} />
{/if}

{#if selectedFeedId !== 'home'}
	{#key refreshFeedFlag || selectedFeedId}
		<InfiniteFeed
			url={`/api/feeds/${selectedFeedId}/posts`}
			listComponent={PostMetadataDisplay}
			transformItems={(items, newItems) => {
				const newUnique = newItems.filter((ni) => !items.find((i) => i.id === ni.id));
				return [...items, ...newUnique];
			}}
		/>
	{/key}
{:else}
	<InfiniteFeed url="/api/feeds/home" listComponent={PostMetadataDisplay} />
{/if}
