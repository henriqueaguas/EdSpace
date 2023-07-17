<script lang="ts">
	import UserImage from './UserImage.svelte';

	export let item: tuser.UserPublicStatsMy;
</script>

<div class="flex flex-row items-center w-full">
	<div
		class="flex w-14 h-14 md:w-20 md:h-20 justify-center items-center text-2xl md:text-3xl font-bold text-white text-opacity-60"
	>
		{item.ranking_position || 0}
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<a
		href={`/users/${item.id}`}
		class="flex items-center justify-between w-full max-h-20 shadow-md shadow-black md:h-40 bg-darker text-orange rounded-[80px] p-5 transition-all hover:scale-[101%] cursor-pointer"
	>
		<div class="flex flex-row justify-between h-full items-center w-full">
			<div id="user-stats" class="flex flex-row items-center h-full gap-3 md:gap-5 w-full">
				<UserImage
					imageLink={item.image}
					cl="profile-picture-micro md:profile-picture-small !rounded-full overflow-hidden"
				/>

				<div class="flex flex-col w-full">
					<span class="flex items-center gap-2">
						<a
							href={`/users/${item.id}`}
							class="text-sm font-bold md:text-2xl underline-offset-4 hover:underline"
							>{item.name}</a
						>
						{#if item.avg_post_rating}
							<div class="text-xs md:text-xl">
								{item.avg_post_rating.toFixed(1)}/5.0
							</div>
						{/if}
					</span>

					<div class="text-xs md:text-sm max-w-[90%] ">
						Publishes on {item.topics_user_publishes_on &&
						item.topics_user_publishes_on.length <= 3
							? item.topics_user_publishes_on.join(', ')
							: `${item.topics_user_publishes_on.slice(0, 3).join(', ')} and more`}
					</div>
				</div>
			</div>

			{#if item.score}
				<div class="text-xs md:text-base font-bold">{Math.floor(item.score * 1000)}</div>
			{/if}
		</div>
	</a>
</div>
