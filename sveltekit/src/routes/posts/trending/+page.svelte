<script lang="ts">
	import Selector from '../../(components)/Selector.svelte';
	import TrendingPostsList from '../../(components)/TrendingPostsList.svelte';

	const TrendingTimings: Array<{ label: string; value: svct.inputs.post.PossibleDates }> = [
		{
			label: 'Yesterday',
			value: 'yesterday'
		},
		{
			label: 'Week',
			value: 'week'
		},
		{
			label: 'Year',
			value: 'year'
		}
	];

	let timing: svct.inputs.post.PossibleDates = 'week';
</script>

<svelte:head>
	<title>Trending Posts</title>
</svelte:head>

<div class="flex flex-col items-center gap-5">
	<h2 class="text-orange">Trending</h2>

	<Selector options={TrendingTimings} bind:selectedOption={timing} />

	{#key timing}
		<TrendingPostsList url={`/api/posts/trending?timing=${timing}`} />
	{/key}
</div>
