<script lang="ts">
	import UserImage from './UserImage.svelte';
	import { page } from '$app/stores';
	import { makeRequest } from '../(utils)/makeRequest';

	export let item: tuser.UserPublicStatsMy;

	$: am_i_following = item.am_i_following;
	$: session = $page.data.session;

	function toggleFollowUser() {
		const prev = am_i_following;
		am_i_following = !am_i_following;

		makeRequest(
			`/api/users/${item.id}/${prev ? 'unfollow' : 'follow'}`,
			{ method: 'POST' },
			{
				onError() {
					// Restore to previous state
					am_i_following = prev;
				}
			}
		);
	}
</script>

<div class="flex flex-col items-center justify-center min-w-fit max-w-[100px]">
	<UserImage imageLink={item.image} size="small" />
	<a href={`/users/${item.id}`} class="text-lg font-bold mt-1 hover:underline">{item.name}</a>
	<div>
		<span class="text-base font-bold">{item.followers_count} </span>
		<span>followers</span>
	</div>
	{#if session && session.user.id !== item.id}
		<button
			on:click={toggleFollowUser}
			class={`mbtn text-md font-bold w-full mt-1 transition-all hover:-translate-y-[2px] ${
				am_i_following
					? 'border-darkOrange bg-darkOrange text-dark'
					: 'border-dark bg-dark text-darkOrange'
			}`}
		>
			{#if am_i_following}
				Unfollow
			{:else}
				Follow
			{/if}
		</button>
	{/if}
</div>
