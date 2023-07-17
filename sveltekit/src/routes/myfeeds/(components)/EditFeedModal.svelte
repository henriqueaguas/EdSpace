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

	export let feedId: string;
	export let onFeedUpdated: (
		args:
			| {
					events: Array<'change_name' | 'change_topics_or_authors'>;
					updatedFeed: svct.outputs.feed.Update;
			  }
			| { events: 'deleted' }
	) => void;
	export let onClose: () => void;

	let initialValues:
		| {
				feedName: string;
				topics: string[];
				authors: tuser.UserPublicStats[];
		  }
		| { feedName?: never; topics?: never; authors?: never } = {};

	let feedName: string = '';
	let topics: string[] = [];
	let authors: tuser.UserPublicStats[] = [];

	let formErrors: Record<string, string> = {};

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

	function deleteFeed() {
		makeRequest(
			`/api/feeds/${feedId}`,
			{ method: 'DELETE' },
			{
				onSuccess() {
					notify.success('Feed Deleted!');
					onFeedUpdated({ events: 'deleted' });
					onClose();
				}
			}
		);
	}

	function updateFeed() {
		if (typeof initialValues.feedName !== 'string') return;

		const events: Array<'change_name' | 'change_topics_or_authors'> = [];

		if (
			JSON.stringify(authors) !== JSON.stringify(initialValues.authors) ||
			JSON.stringify(topics) !== JSON.stringify(initialValues.topics)
		) {
			events.push('change_topics_or_authors');
		}

		if (feedName !== initialValues.feedName) events.push('change_name');

		if (events.length === 0) {
			notify.info('Nothing changed');
			return;
		}

		try {
			feedNameSchema.parseSync(feedName);
			makeRequest(
				`/api/feeds/${feedId}`,
				{
					method: 'PATCH',
					body: {
						name: feedName,
						topics: topics,
						authors: authors.map((a) => a.id)
					}
				},
				{
					onSuccess(res) {
						notify.success('Feed Updated!');
						onFeedUpdated({ events: events, updatedFeed: res });
					}
				}
			);
		} catch (e) {
			formErrors.name = (e as ParseObjectError).message;
			notify.error('Some fields are not correct!');
		}
	}

	onMount(() => {
		makeRequest<{
			feed: tfeed.Feed;
			topics: ttopic.TopicStats[];
			authors: tuser.UserPublicStats[];
		}>(`/api/feeds/${feedId}`, undefined, {
			onSuccess({ feed, topics: topicsRes, authors: authorsRes }) {
				initialValues.feedName = feed.name;
				initialValues.topics = topicsRes.map((t) => t.id);
				initialValues.authors = authorsRes;

				feedName = feed.name;
				topics = topicsRes.map((t) => t.id);
				authors = [...authorsRes];
			}
		});
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	on:click={onClose}
	class="fixed flex items-center gap-7 justify-center bg-opacity-50 top-0 left-0 h-screen w-screen bg-dark z-10"
>
	<div
		id="create-feed"
		class="flex flex-col items-center justify-start gap-5 py-10 max-w-[90vw] w-[700px] h-[80vh] max-h-[700px] text-orange overflow-y-scroll bg-darker rounded-xl border-2 border-black shadow-black shadow-lg"
		on:click|stopPropagation
		on:scroll|preventDefault
	>
		<h3 class="flex gap-2 items-center justify-center">
			Edit Feed
			<span on:click={deleteFeed} class="cursor-pointer">
				<Icon name="Trash2" cl="text-red-600 pb-1 scale-100 md:scale-125" />
			</span>
		</h3>
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
			<button
				on:click={updateFeed}
				class="mbtn-invert hover:scale-[102%] opacity-80 py-1 md:py-3"
			>
				Update Feed
			</button>
		</span>
	</div>
</div>
