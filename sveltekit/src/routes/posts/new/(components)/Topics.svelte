<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import TopicSelector from '../../../(components)/TopicSelector.svelte';
	import LimitTracker from './LimitTracker.svelte';
	import { LogicConstraints } from '$lib/services/constraints';
	import { onClickedOutside } from '../../../(utils)/onClickedOutside';
	import Icon from '../../../(assets)/Icon.svelte';

	export let topics: string[] = [];

	let showTopicSearch = false;

	function removeTopic(topic: string) {
		topics.splice(topics.indexOf(topic), 1);
		topics = topics;
	}

	function addTopic(newTopic: string) {
		topics = [...topics, newTopic];
		if (topics.length === LogicConstraints.Posts.MAX_POST_TOPICS) {
			showTopicSearch = false;
		}
	}

	let topicSelectorParent: HTMLElement;
	let removeEvent: (() => void) | null = null;

	$: {
		if (topicSelectorParent) {
			removeEvent?.();
			removeEvent = onClickedOutside(topicSelectorParent, () => (showTopicSearch = false));
		}
	}

	onDestroy(() => {
		removeEvent?.();
	});
</script>

<div id="topic-select" class="flex flex-col gap-2">
	<label for="select" class="text-xl font-bold text-orange text-opacity-80"> Topics </label>
	<ul id="selected-topics" class="flex items-center justify-start gap-2 flex-wrap min-h-[40px]">
		{#each topics as topic}
			<li
				class="bg-orange whitespace-nowrap text-dark py-1 px-3 rounded-xl font-bold w-fit flex items-center justify-center gap-1"
			>
				{topic}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span
					on:click={() => removeTopic(topic)}
					class="cursor-pointer transition-all hover:scale-110"
				>
					<Icon name="X" />
				</span>
			</li>
		{/each}
		{#if topics.length < LogicConstraints.Posts.MAX_POST_TOPICS}
			{#if showTopicSearch}
				<span bind:this={topicSelectorParent} class="z-10">
					<TopicSelector
						on:hide={() => (showTopicSearch = false)}
						onTopicSelected={addTopic}
						selectedTopics={topics}
					/>
				</span>
			{:else}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<li
					id="add-topic-button"
					class="mbtn opacity-50"
					on:click={() => (showTopicSearch = !showTopicSearch)}
				>
					+
				</li>
			{/if}
		{/if}
	</ul>

	<LimitTracker
		curr={topics.length}
		min={LogicConstraints.Posts.MIN_POST_TOPICS}
		max={LogicConstraints.Posts.MAX_POST_TOPICS}
	/>
</div>
