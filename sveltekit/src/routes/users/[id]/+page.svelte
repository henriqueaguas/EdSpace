<script lang="ts">
	import UserImage from './../../(components)/UserImage.svelte';
	import MultiList from '../../(components)/MultiInfiniteScroll.svelte';
	import PostMetadataDisplay from '../../(components)/PostMetadataDisplay.svelte';
	import type { PageData } from './$types';
	import { formatDate, formatNumber } from '../../api/(utils)/formatDate';
	import UserDisplay from '../../(components)/UserDisplay.svelte';
	import { makeRequest } from '../../(utils)/makeRequest';
	import Icon from '../../(assets)/Icon.svelte';
	import EditProfileProcess from './(components)/EditProfileProcess.svelte';

	export let data: PageData;

	$: user = data.user;
	$: isMyProfile = user.id === data.session?.user.id;
	$: amIFollowing = isMyProfile ? null : (user as tuser.UserPublicStatsMy).am_i_following;

	let showEditProfileProcess = false;

	function toggleFollow() {
		const prev = amIFollowing;
		amIFollowing = !amIFollowing;
		makeRequest(
			`/api/users/${user.id}/${prev ? 'unfollow' : 'follow'}`,
			{ method: 'POST' },
			{
				onError() {
					amIFollowing = prev;
				}
			}
		);
	}

	function openProfileEditor() {
		showEditProfileProcess = true;
	}
</script>

<svelte:head>
	<title>Profile | {user.name}</title>
</svelte:head>

<div
	class="bg-orange flex md:flex-row flex-col items-center justify-center p-5 min-h-[260px] max-w-[800px] w-[75vw] rounded-xl shadow-black shadow-md transition-transform"
>
	<div
		class="flex flex-col items-center justify-center rounded-lg gap-5 mt-5 ml-5 mb-5 mr-4 h-full"
	>
		<UserImage imageLink={user.image} size="big" />
		{#if data.session && !isMyProfile}
			{#if amIFollowing}
				<button on:click|preventDefault={toggleFollow} class="mbtn-invert border-dark">
					Unfollow
				</button>
			{:else}
				<button on:click|preventDefault={toggleFollow} class="mbtn border-orange">
					Follow
				</button>
			{/if}
		{/if}

		{#if isMyProfile}
			<Icon
				on:click={openProfileEditor}
				name="EditIcon"
				parentCl="ml-3 cursor-pointer"
				cl="scale-125 text-black"
			/>

			{#if showEditProfileProcess}
				<EditProfileProcess onClose={() => (showEditProfileProcess = false)} />
			{/if}
		{/if}
	</div>

	<div
		class="flex flex-col items-center md:items-start ml-4 text-dark mr-5 max-w-full md:max-w-[65%]"
	>
		<div class="flex gap-2 items-center">
			<h3 class="font-bold text-center">{user.name}</h3>
			{#if user.avg_post_rating}
				<p class="text-lg font-semibold">
					{user.avg_post_rating.toFixed(1)}/5.0
				</p>
			{/if}
		</div>

		<p class="text-sm ml-1">user since {formatDate(user.created_at)}</p>

		{#if user.posts_published}
			<div class="flex gap-2 items-center ml-1 mt-2 mb-1">
				<p class="text-sm font-semibold">{formatNumber(user.followers_count)} followers</p>
				<div class="w-[5px] h-[5px] bg-dark rounded-full" />
				<p class="text-sm font-semibold">{formatNumber(user.posts_published)} posts</p>
			</div>
		{/if}

		{#if user.ranking_position}
			<div class="flex flex-row items-center gap-1 ml-1">
				<span class="fill-orange">
					<Icon name="Crown" />
				</span>
				<p class="text-sm md:text-base font-semibold">
					{formatNumber(user.ranking_position)} º Global Ranking
				</p>
			</div>
		{/if}

		{#if user.topics_user_publishes_on.length > 0}
			<p
				class="text-center md:text-start text-xs md:text-base font-semibold ml-1 mt-2 opacity-[85%] max-w-[95%]"
			>
				Publishes on {user.topics_user_publishes_on.slice(0, 5).join(', ')}
			</p>
		{/if}
	</div>
</div>

{#key user.id}
	<MultiList
		lists={[
			{
				name: 'User Posts',
				listComponentArgs: {
					url: `/api/users/${user.id}/posts`,
					listComponent: PostMetadataDisplay
				}
			},
			{
				name: 'Following',
				listComponentArgs: {
					url: `/api/users/${user.id}/follows`,
					listComponent: UserDisplay
				}
			},
			{
				name: 'Followers',
				listComponentArgs: {
					url: `/api/users/${user.id}/followers`,
					listComponent: UserDisplay
				}
			},
			isMyProfile
				? {
						name: 'Saved Posts',
						listComponentArgs: {
							url: `/api/me/savedPosts`,
							listComponent: PostMetadataDisplay
						}
				  }
				: undefined
		]}
	/>
{/key}
