<script lang="ts">
	import Icon from './../(assets)/Icon.svelte';
	import FileDropZone from './FileDropZone.svelte';
	import { onMount } from 'svelte';
	import { makeRequest } from '../(utils)/makeRequest';
	import { notify } from '../(utils)/notify';
	import TopicDisplay from './TopicDisplay.svelte';
	import TopicSelector from './TopicSelector.svelte';
	import UserDisplay from './UserDisplay.svelte';
	import UserSelector from './UserSelector.svelte';
	import { page } from '$app/stores';
	import UserImage from './UserImage.svelte';
	import { LogicConstraints } from '$lib/services/constraints';

	export let onClose: () => void;

	const session = $page.data.session!;

	type Phase = 'entry' | 'topics' | 'authors' | 'profile';

	let currentPhase: Phase = 'entry';

	let topics: ttopic.TopicStatsMy[] = [];

	let authors: tuser.UserPublicStatsMy[] = [];

	let newImageFile: File | undefined = undefined;
	let newUsername: string = session?.user.name;

	function onTopicSelected(topicId: string) {
		makeRequest(
			`/api/topics/${topicId}/follow`,
			{ method: 'POST' },
			{
				onSuccess(res) {
					makeRequest<ttopic.TopicStatsMy>(`/api/topics/${topicId}`, undefined, {
						onSuccess(res) {
							notify.success(`You are now following ${res.id}!`);

							topics.push(res);
							topics = topics;
						}
					});
				}
			}
		);
	}

	function onUserSelected(userId: string) {
		makeRequest(
			`/api/users/${userId}/follow`,
			{ method: 'POST' },
			{
				onSuccess(res) {
					makeRequest<tuser.UserPublicStatsMy>(`/api/users/${userId}`, undefined, {
						onSuccess(res) {
							notify.success(`You are now following ${res.name}!`);

							authors.push(res);
							authors = authors;
						}
					});
				}
			}
		);
	}

	function completeProcess() {
		// Complete process
		makeRequest(
			'/api/me/signupCompleted',
			{ method: 'POST' },
			{
				onSuccess() {
					onClose();
					notify.success('Sign Up process completed!');
				}
			}
		);
	}

	async function gotoNextPhase() {
		if (currentPhase === 'entry') {
			currentPhase = 'topics';
		} else if (currentPhase === 'topics') {
			const topicIdsFollowing = topics.filter((t) => t.am_i_following).map((t) => t.id);

			// Skip "authors" phase if user did not follow any topics
			if (topicIdsFollowing.length === 0) {
				currentPhase = 'profile';
				return;
			}

			currentPhase = 'authors';
			makeRequest<tuser.UserPublicStatsMy[]>(
				`/api/users/topAuthors?topics=${topicIdsFollowing.join(',')}`,
				undefined,
				{
					onSuccess(res) {
						authors = res;
					}
				}
			);
		} else if (currentPhase === 'authors') {
			currentPhase = 'profile';
		} else {
			const body = new FormData();

			body.set(
				'metadata',
				JSON.stringify(
					newUsername !== session.user.name
						? {
								name: newUsername
						  }
						: {}
				)
			);

			if (newImageFile) {
				body.set('file', newImageFile);
			}

			if (newImageFile || newUsername !== session.user.name) {
				const loadingNotification = notify.infiniteLoading(
					'Updating profile information...'
				);

				await makeRequest<string>(
					'/api/me',
					{
						method: 'PATCH',
						body
					},
					{
						onSuccess: () => {
							loadingNotification.remove();
							notify.success('Profile Information Updated!');
						},

						onError(e) {
							loadingNotification.remove();
							notify.error(e.message);

							// Reset fields
							newUsername = session.user.name;
							newImageFile = undefined;
						}
					}
				);
			}

			completeProcess();
		}
	}

	onMount(() => {
		makeRequest<ttopic.TopicStatsMy[]>('/api/topics/random', undefined, {
			onSuccess(res) {
				topics = res;
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
		class="flex flex-col items-center justify-start gap-5 py-10 max-w-[95vw] w-[1000px] h-[1000px] max-h-[90vh] text-orange overflow-y-scroll bg-darker rounded-xl border-2 border-black shadow-black shadow-lg"
		on:click|stopPropagation
		on:scroll|preventDefault
	>
		<div
			class={`flex gap-6 flex-col items-center max-w-[90%] ${
				currentPhase === 'entry' ? 'h-full justify-center' : ''
			}`}
		>
			{#if currentPhase === 'entry'}
				<h1>Welcome to EdSpace</h1>

				<p class="text-lg md:text-xl text-center">
					Before starting your journey, we would like to know what topics and authors you
					might enjoy!
				</p>
			{:else if currentPhase === 'topics'}
				<h2>Follow topics</h2>

				<div class="w-[80%] max-w-[500px]">
					<span>Search for other topics</span>
					<TopicSelector
						selectedTopics={topics.map((t) => t.id)}
						{onTopicSelected}
						cl="border-opacity-70"
					/>
				</div>

				<ul class="flex gap-1 flex-wrap justify-center">
					{#each topics as topic}
						<TopicDisplay item={topic} cl="w-[100%] md:w-[45%]" />
					{/each}
				</ul>
			{:else if currentPhase === 'authors'}
				<h2>Follow authors</h2>

				<div class="w-[80%] max-w-[500px]">
					<span>Search for other authors</span>
					<UserSelector
						selectedUsers={authors}
						onUserSelected={(u) => onUserSelected(u.id)}
						cl="border-opacity-70"
					/>
				</div>

				<ul class="flex gap-1 flex-wrap justify-center">
					{#each authors as author}
						<UserDisplay item={author} />
					{/each}
				</ul>
			{:else if currentPhase === 'profile'}
				<div class="flex flex-col justify-center items-center gap-2">
					<h2>Edit your profile</h2>
					<span class="text-white text-opacity-60">(you can skip this)</span>
				</div>

				<section class="flex flex-col gap-2 w-full">
					<span class="font-bold">Change Username</span>
					<input class="input-border" bind:value={newUsername} />
				</section>

				<section class="flex flex-col gap-2 w-full">
					<span class="font-bold">Change Image</span>
					<div class="flex w-full items-center justify-around gap-2">
						<div class="flex flex-col justify-start items-center gap-3">
							<UserImage
								imageLink={newImageFile
									? URL.createObjectURL(newImageFile)
									: session.user.image}
								size="big"
							/>

							{#if newImageFile}
								<span
									on:click={() => (newImageFile = undefined)}
									class="cursor-pointer"
								>
									<Icon name="Trash2" cl="text-red-600" />
								</span>
							{/if}
						</div>

						<FileDropZone
							bind:file={newImageFile}
							validFileExtensions={LogicConstraints.User.PROFILE_PICTURE
								.ALLOWED_PROFILE_PICTURE_FILE_EXTENSIONS_LIST}
							cl="max-h-[160px]"
						/>
					</div>
				</section>
			{/if}

			<button class="mbtn-invert" on:click={gotoNextPhase}
				>{currentPhase !== 'profile' ? 'Next' : 'Finish'}</button
			>
			<button
				on:click={completeProcess}
				class="-my-4 underline underline-offset-2  text-white text-opacity-60">skip</button
			>
		</div>
	</div>
</div>
