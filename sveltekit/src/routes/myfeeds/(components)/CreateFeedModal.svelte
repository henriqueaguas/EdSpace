<script lang="ts">
	import type { ParseObjectError } from '$lib/_errors/ParseObjectError';
	import { feedNameSchema } from '$lib/services/InputValidators/commonValidators';
	import { LogicConstraints } from '$lib/services/constraints';
	import { onMount } from 'svelte';
	import Icon from '../../(assets)/Icon.svelte';
	import TopicSelector from '../../(components)/TopicSelector.svelte';
	import UserSelector from '../../(components)/UserSelector.svelte';
	import { makeRequest } from '../../(utils)/makeRequest';
	import { notify } from '../../(utils)/notify';
	import LimitTracker from '../../posts/new/(components)/LimitTracker.svelte';
	import ShowFormError from '../../posts/new/(components)/ShowFormError.svelte';
	import UserImage from '../../(components)/UserImage.svelte';

	export let onFeedCreated: (newFeed: tfeed.Feed) => void;
	export let onClose: () => void;

	let feedName: string = '';
	let topics: string[] = [];
	let authors: tuser.UserPublicStats[] = [];

	let formErrors: Record<string, string> = {};

	let nameInput: HTMLElement;

	function clearFieldError(fieldId: 'name') {
		delete formErrors[fieldId];
		formErrors = formErrors;
	}

	function removeTopic(topic: string) {
		const idx = topics.indexOf(topic);
		if (idx === -1) return;
		topics.splice(idx, 1);
		topics = topics;
	}

	function addTopic(newTopic: string) {
		topics = [...topics, newTopic];
	}

	function addAuthor(newAuthor: tuser.UserPublicStats) {
		authors = [...authors, newAuthor];
	}

	function removeAuthor(authorId: string) {
		const idx = authors.findIndex((a) => a.id === authorId);
		if (idx === -1) return;
		authors.splice(idx, 1);
		authors = authors;
	}

	function createFeed() {
		try {
			feedNameSchema.parseSync(feedName);
		} catch (e) {
			formErrors.name = (e as ParseObjectError).message;
			notify.error('Some fields are not correct!');
			return;
		}

		makeRequest<tfeed.Feed>(
			'/api/feeds',
			{
				method: 'POST',
				body: {
					name: feedName,
					topics: topics,
					authors: authors.map((a) => a.id)
				}
			},
			{
				onSuccess(newFeed) {
					notify.success('Feed Created');
					onFeedCreated(newFeed);
					onClose();
				}
			}
		);
	}

	onMount(() => {
		nameInput.focus();
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	on:click={onClose}
	class="fixed flex items-center justify-center bg-opacity-50 top-0 left-0 h-screen w-screen bg-dark z-10"
>
	<div
		id="create-feed"
		class="flex flex-col items-center justify-start gap-7 py-10 max-w-[90vw] w-[700px] h-[80vh] max-h-[700px] text-orange overflow-y-scroll bg-darker rounded-xl border-2 border-black shadow-black shadow-lg"
		on:click|stopPropagation
		on:scroll|preventDefault
	>
		<h3>Create Feed</h3>
		<span id="feed-name" class="flex flex-col gap-1">
			<label for="feed-name-input" class="font-bold text-xl">
				Name
				<LimitTracker
					curr={feedName.length}
					min={LogicConstraints.Feed.NAME.min_chars}
					max={LogicConstraints.Feed.NAME.max_chars}
					cl="text-sm"
				/>
			</label>
			<ShowFormError error={formErrors.name} cl="text-sm md:text-base" />
			<input
				bind:this={nameInput}
				bind:value={feedName}
				on:input={() => clearFieldError('name')}
				id="feed-name-input"
				type="text"
				class="input-border w-full"
			/>
		</span>

		<span id="feed-topics" class="flex flex-col gap-4 items-center">
			<div class="flex flex-col gap-1">
				<label for="feed-topics-input" class="font-bold text-xl">
					Topics
					<LimitTracker
						curr={topics.length}
						min={LogicConstraints.Feed.MIN_TOPICS}
						max={LogicConstraints.Feed.MAX_TOPICS}
						cl="text-sm"
					/>
				</label>
				<ShowFormError error={formErrors.topics} cl="text-sm md:text-base" />
				{#if topics.length < LogicConstraints.Feed.MAX_TOPICS}
					<TopicSelector onTopicSelected={addTopic} selectedTopics={topics} />
				{/if}
			</div>

			<ul class="flex items-center justify-center gap-2 flex-wrap max-w-[70%]">
				{#each topics as topic}
					<li
						class="text-xs md:text-sm bg-orange whitespace-nowrap text-dark py-1 px-2 md:px-3 rounded-xl font-bold w-fit flex items-center justify-center gap-1"
					>
						{topic}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span
							on:click={() => removeTopic(topic)}
							class="cursor-pointer transition-all hover:scale-110"
						>
							<Icon name="X" cl="scale-75 md:scale-100" />
						</span>
					</li>
				{/each}
			</ul>
		</span>

		<span id="feed-authors" class="flex flex-col gap-4 items-center">
			<div class="flex flex-col gap-1">
				<label for="feed-authors-input" class="font-bold text-xl">
					Authors
					<LimitTracker
						curr={authors.length}
						min={LogicConstraints.Feed.MIN_AUTHORS}
						max={LogicConstraints.Feed.MAX_AUTHORS}
						cl="text-sm"
					/>
				</label>
				<ShowFormError error={formErrors.authors} cl="text-sm md:text-base" />
				{#if authors.length < LogicConstraints.Feed.MAX_AUTHORS}
					<UserSelector onUserSelected={addAuthor} selectedUsers={authors} />
				{/if}
			</div>

			<ul class="flex items-center justify-center gap-2 flex-wrap max-w-[70%]">
				{#each authors as author}
					<li
						class="text-xs md:text-sm bg-orange whitespace-nowrap text-dark py-1 px-2 md:px-3 rounded-xl font-bold w-fit flex items-center justify-center gap-1"
					>
						<UserImage imageLink={author.image} size="micro" />
						{author.name}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<span
							on:click={() => removeAuthor(author.id)}
							class="cursor-pointer transition-all hover:scale-110"
						>
							<Icon name="X" cl="scale-75 md:scale-100" />
						</span>
					</li>
				{/each}
			</ul>
		</span>

		<span id="feed-buttons">
			<button on:click={createFeed} class="mbtn-invert hover:scale-[102%] opacity-80 py-3">
				Create Feed
			</button>
		</span>
	</div>
</div>
