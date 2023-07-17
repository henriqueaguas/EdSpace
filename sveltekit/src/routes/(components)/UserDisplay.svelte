<script lang="ts">
	import UserImage from './UserImage.svelte';
	import { page } from '$app/stores';
	import { makeRequest } from '../(utils)/makeRequest';

	export let item: tuser.UserPublicStatsMy;
	export let cl: string = '';

	function toggleFollow() {
		const prev = item.am_i_following;
		item.am_i_following = !item.am_i_following;
		makeRequest(
			`/api/users/${item.id}/${prev ? 'unfollow' : 'follow'}`,
			{ method: 'POST' },
			{
				onError() {
					item.am_i_following = prev;
				}
			}
		);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<a
	href={`/users/${item.id}`}
	class={`flex items-center justify-between min-w-fit w-full gap-3 h-24 md:h-32 shadow-md shadow-black bg-darker text-orange rounded-md p-5 transition-all hover:scale-[101%] cursor-pointer ${cl}`}
>
	<div class="flex items-center gap-2 md:gap-5 w-full">
		<UserImage imageLink={item.image} size={'micro'} cl="md:profile-picture-medium" />

		<div id="user-stats" class="h-full">
			<span class="flex items-center gap-2">
				<a
					href={`/users/${item.id}`}
					class="text-sm font-bold md:text-2xl underline-offset-4 hover:underline"
					>{item.name}</a
				>
			</span>

			{#if item.followers_count}
				<div class="text-xs md:text-base">{item.followers_count} followers</div>
			{/if}
			{#if item.posts_published}
				<div class="text-xs md:text-base">{item.posts_published} posts</div>
			{/if}
		</div>
	</div>

	{#if $page.data.session?.user.id !== item.id}
		{#if item.am_i_following}
			<button
				on:click|preventDefault={toggleFollow}
				class="bg-orange text-black text-xs md:text-base py-3 px-3 md:py-4 md:px-6 rounded-md font-bold opacity-90 hover:opacity-100"
			>
				Unfollow
			</button>
		{:else}
			<button
				on:click|preventDefault={toggleFollow}
				class="bg-[#212020] text-white text-xs md:text-base py-3 px-3 md:py-4 md:px-6 rounded-md font-bold opacity-90 hover:opacity-100"
			>
				Follow
			</button>
		{/if}
	{/if}
</a>
