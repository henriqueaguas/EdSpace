<script lang="ts">
	import ShowFormError from './(components)/ShowFormError.svelte';
	import LimitTracker from './(components)/LimitTracker.svelte';
	import Topics from './(components)/Topics.svelte';
	import ContentPages from './(components)/ContentPages.svelte';
	import { clearPagesStore, pages } from './(stores)/postPagesStore';
	import { makeRequest } from '../../(utils)/makeRequest';
	import { goto } from '$app/navigation';
	import { notify } from '../../(utils)/notify';
	import Selector from '../../(components)/Selector.svelte';
	import { capitalizeWord } from '../../(utils)/capitalize';
	import { LogicConstraints } from '$lib/services/constraints';
	import { CreatePostInputSchema } from '$lib/services/InputValidators/post';
	import type { ParseObjectError } from '$lib/_errors/ParseObjectError';

	let postTitle: string = '';
	let postDescription: string = '';
	let postDifficulty: tpost.Difficulty = null;
	let postTopics: string[] = [];

	let formErrors: Record<string, string> = {};

	function clearFieldError(fieldId: 'title' | 'description' | 'topics' | 'difficulty') {
		delete formErrors[fieldId];
		formErrors = formErrors;
	}

	$: {
		postTitle;
		clearFieldError('title');
	}
	$: {
		postDescription;
		clearFieldError('description');
	}
	$: {
		postDifficulty;
		clearFieldError('difficulty');
	}
	$: {
		postTopics;
		clearFieldError('topics');
	}

	async function createPost() {
		// clear previous errors
		formErrors = {};

		const metadata = {
			title: postTitle,
			description: postDescription.length === 0 ? null : postDescription,
			difficulty: postDifficulty,
			topics: postTopics
		};
		// 1. Validate metadata on the client and give visual feedback (does not hit server on fail)
		try {
			CreatePostInputSchema.parseSync(metadata);
		} catch (e) {
			const error = e as ParseObjectError;
			formErrors = error.fieldErrors;
			notify.error('Some fields are not correct!');
			return;
		}
		// 2. Build body
		const body = new FormData();

		/// 2.1 Add metadata
		body.set('metadata', JSON.stringify(metadata));

		/// 2.2 Add post pages (as blobs)
		let fileCounter = 0;
		for (const page of $pages) {
			if (page.type === 'Image' || page.type === 'PDF') {
				body.set(`file-${fileCounter++}`, page.content);
			} else if (page.type === 'Markdown') {
				if (typeof page.content === 'string') {
					body.set(
						`file-${fileCounter++}`,
						new Blob([page.content], { type: 'text/markdown' })
					);
				} else {
					body.set(`file-${fileCounter++}`, page.content);
				}
			} else if (page.type === 'Quiz') {
				body.set(
					`file-${fileCounter++}`,
					new Blob([JSON.stringify(page.content)], { type: 'application/json+quiz' })
				);
			}
		}

		const loadingNotification = notify.infiniteLoading('Uploading post...');

		// 3. Make the request
		await makeRequest<string>(
			'/api/posts',
			{
				method: 'POST',
				body
			},
			{
				onSuccess: (postId) => {
					loadingNotification.remove();
					notify.success('Success! Redirecting you to the post page...');

					setTimeout(() => {
						goto(`/posts/${postId}`);

						setTimeout(clearPagesStore, 2000);
					}, 2000);
				},
				onError(e) {
					loadingNotification.remove();
					notify.error(e.message);
				}
			}
		);
	}

	const difficultyOptions = LogicConstraints.Posts.POSSIBLE_DIFFICULTIES.map((d) => ({
		label: !d ? 'Not Specified' : capitalizeWord(d),
		value: d
	}));
</script>

<svelte:head>
	<title>Create Post</title>
</svelte:head>

<div class="mt-12 max-w-[1350px] w-[90vw] md:w-[90vw] flex flex-col gap-2">
	<h1 class="text-start mb-2">Write a Post</h1>

	<input
		bind:value={postTitle}
		type="text"
		placeholder="Title"
		maxlength={LogicConstraints.Posts.TITLE_LENGTH.max_chars}
		class="input-border-down text-xl md:text-3xl w-full font-bold py-3 px-4"
	/>
	<ShowFormError error={formErrors.title} />
	<LimitTracker
		curr={postTitle.length}
		min={LogicConstraints.Posts.TITLE_LENGTH.min_chars}
		max={LogicConstraints.Posts.TITLE_LENGTH.max_chars}
	/>

	<textarea
		bind:value={postDescription}
		placeholder="Description (optional)"
		maxlength={LogicConstraints.Posts.DESCRIPTION_LENGTH.max_chars}
		class="input-border-down text-base md:text-xl min-h-16 h-28 w-full py-3 px-4"
	/>
	<ShowFormError error={formErrors.description} />
	<LimitTracker
		curr={postDescription.length}
		min={LogicConstraints.Posts.DESCRIPTION_LENGTH.min_chars}
		max={LogicConstraints.Posts.DESCRIPTION_LENGTH.max_chars}
	/>

	<div id="difficulty" class="flex justify-start items-center gap-4 mt-2">
		<div id="difficuly-select" class="flex flex-col gap-2 my-2 mt-2 h-full ">
			<label for="select" class="text-xl font-bold text-orange text-opacity-80"
				>Difficulty</label
			>
			<Selector options={difficultyOptions} bind:selectedOption={postDifficulty} />
		</div>
	</div>
	<ShowFormError error={formErrors.difficulty} />

	<Topics bind:topics={postTopics} />
	<ShowFormError error={formErrors.topics} />

	<ContentPages MAX_PAGES_COUNT={LogicConstraints.Posts.MAX_POST_PAGES} />

	<button
		class="mbtn-invert w-36 md:w-48 py-2 md:py-4 text-xl font-bold my-4 opacity-80 transition-all hover:-translate-y-1"
		on:click={createPost}
	>
		Publish
	</button>
</div>
