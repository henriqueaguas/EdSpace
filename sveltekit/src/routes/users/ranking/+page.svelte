<script lang="ts">
	import UserImage from '../../(components)/UserImage.svelte';
	import InfiniteScroll from '../../(components)/InfiniteScroll.svelte';
	import TopicSelector from '../../(components)/TopicSelector.svelte';
	import Icon from '../../(assets)/Icon.svelte';
	import Selector from '../../(components)/Selector.svelte';
	import UserRankDisplay from '../../(components)/UserRankDisplay.svelte';
	import Loader from '../../(components)/Loader.svelte';

	const RankingSelector: Array<{ label: string; value: svct.inputs.user.RankingSelectors }> = [
		{
			label: 'Global',
			value: 'global'
		},
		{
			label: 'Topic',
			value: 'topic'
		}
	];

	let selector: svct.inputs.user.RankingSelectors = 'global';

	$: {
		if (selector == 'global') {
			topicId = null;
		}
	}

	let topicId: string | null = null;

	function onTopicSelected(topic: string) {
		topicId = topic;
	}

	let podiumUsers: tuser.UserPublicStatsMy[] = [];

	function setPodiumUsers(items: tuser.UserPublicStatsMy[], isFirstFetch: boolean) {
		if (isFirstFetch) {
			podiumUsers = items;
		}
	}
</script>

<svelte:head>
	<title>Ranking</title>
</svelte:head>

<div class="flex flex-col items-center gap-6">
	<h2 class="text-orange">Ranking</h2>

	{#if podiumUsers.length > 0}
		<div class="flex justify-start items-center gap-4 md:gap-20 w-[85%]">
			{#if podiumUsers}
				<div class="flex flex-col items-center justify-center pt-28 gap-3 w-1/3">
					{#if podiumUsers[1]}
						<h4 class="font-bold">2 º 🥈</h4>

						<span
							class="rounded-full overflow-hidden shadow-orange border-4 border-orange"
						>
							<UserImage imageLink={podiumUsers[1].image} />
						</span>

						<a
							href={`/users/${podiumUsers[1].id}`}
							class="text-center text-lg font-bold md:text-2xl underline-offset-4 hover:underline"
							>{podiumUsers[1].name}
						</a>
					{/if}
				</div>

				<div class="flex flex-col items-center justify-center gap-3 w-1/3">
					{#if podiumUsers[0]}
						<h4 class="font-bold">1 º 👑</h4>

						<span
							class="rounded-full overflow-hidden shadow-orange border-4 border-orange"
						>
							<UserImage imageLink={podiumUsers[0].image} />
						</span>
						<a
							href={`/users/${podiumUsers[0].id}`}
							class="text-center text-lg font-bold md:text-2xl underline-offset-4 hover:underline"
							>{podiumUsers[0].name}
						</a>
					{/if}
				</div>

				<div class="flex flex-col items-center justify-center pt-36 gap-3 w-1/3">
					{#if podiumUsers[2]}
						<h4 class="font-bold">3 º 🥉</h4>

						<span
							class="rounded-full overflow-hidden shadow-orange border-4 border-orange"
						>
							<UserImage imageLink={podiumUsers[2].image} />
						</span>
						<a
							href={`/users/${podiumUsers[2].id}`}
							class="text-center text-lg font-bold md:text-2xl underline-offset-4 hover:underline"
							>{podiumUsers[2].name}
						</a>
					{/if}
				</div>
			{:else}
				<Loader />
			{/if}
		</div>
	{/if}

	<Selector options={RankingSelector} bind:selectedOption={selector} cl="mb-6" />

	{#if selector === 'topic'}
		{#if topicId === null}
			<TopicSelector {onTopicSelected} />
		{:else}
			<div
				class="text-sm md:text-lg bg-orange whitespace-nowrap text-dark py-2 px-3 md:px-12 rounded-xl font-bold w-fit flex items-center justify-center gap-1"
			>
				{topicId}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span
					on:click={() => {
						topicId = null;
					}}
					class="cursor-pointer transition-all hover:scale-110"
				>
					<Icon name="X" cl="scale-75 md:scale-100" />
				</span>
			</div>
		{/if}
	{/if}

	{#key topicId}
		<InfiniteScroll
			url={topicId ? `/api/users/ranking?topicId=${topicId}` : `/api/users/ranking`}
			listComponent={UserRankDisplay}
			onNewItems={(_, items, isFirstFetch) => setPodiumUsers(items, isFirstFetch)}
		/>
	{/key}
</div>
