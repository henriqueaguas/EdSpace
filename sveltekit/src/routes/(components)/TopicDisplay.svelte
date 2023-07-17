<script lang="ts">
	import { makeRequest } from '../(utils)/makeRequest';

	export let item: ttopic.TopicStatsMy;
	export let cl: string = '';

	async function unfollow(e: Event) {
		// Optimistic Update
		item.am_i_following = false;
		makeRequest(
			`/api/topics/${item.id}/unfollow`,
			{ method: 'POST' },
			{
				onSuccess() {
					item.am_i_following = false;
				},
				onError() {
					item.am_i_following = true;
				}
			}
		);
	}

	async function follow(e: Event) {
		// Optimistic Update
		item.am_i_following = true;
		makeRequest(
			`/api/topics/${item.id}/follow`,
			{ method: 'POST' },
			{
				onSuccess() {
					item.am_i_following = true;
				},
				onError() {
					item.am_i_following = false;
				}
			}
		);
	}
</script>

<!--  
	data-sveltekit-preload-data="off" to avoid situations where the data is preloaded and the user has not followed the topic, 
	then follows and navigates to page. 
	If preload-data was on the user would see outdated information.
-->
<a
	data-sveltekit-preload-data="off"
	data-sveltekit-preload-code="hover"
	href={`/topics/${item.id}`}
	id="topic-card"
	class={`flex items-center gap-0 md:gap-10 justify-between w-full max-w-[500px] md:h-40 shadow-md shadow-black border-2 border-orange bg-darker text-orange rounded-md p-2 md:p-5 transition-all hover:scale-[101%] cursor-pointer ${cl}`}
>
	<div id="topic-data" class="flex flex-col items-start leading-1">
		<a href={`/topics/${item.id}`} class="text-base md:text-xl font-bold hover:underline mb-1"
			>{item.id}</a
		>

		<span class="pl-[2px] text-xs md:text-lg text-white text-opacity-60"
			>{item.followers_count} followers</span
		>
		<span class="pl-[2px] text-xs md:text-lg text-white text-opacity-60"
			>{item.posts_count} posts</span
		>
	</div>
	{#if item.am_i_following}
		<button
			on:click|preventDefault={unfollow}
			class="bg-orange text-black text-xs md:text-base py-3 px-3 md:py-4 md:px-6 rounded-md font-bold opacity-90 hover:opacity-100"
		>
			Unfollow
		</button>
	{:else}
		<button
			on:click|preventDefault={follow}
			class="bg-[#212020] text-white text-xs md:text-base py-3 px-3 md:py-4 md:px-6 rounded-md font-bold opacity-90 hover:opacity-100"
		>
			Follow
		</button>
	{/if}
</a>
