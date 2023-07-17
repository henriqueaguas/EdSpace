<script lang="ts">
	import { formatDate, formatNumber } from '../api/(utils)/formatDate';
	import { capitalizeWord } from '../(utils)/capitalize';
	import Icon from '../(assets)/Icon.svelte';

	export let item: tpost.PostStats;
</script>

<div
	class={`bg-darker shadow-xl flex ${
		item.description === null ? 'flex-row' : 'flex-col'
	} justify-start max-w-[700px] w-[90vw] rounded-md mb-2 py-4 px-4 sm:px-6 transition-all hover:scale-[100.3%] shadow-sm shadow-black`}
>
	<div class="relative flex flex-col md:flex-row items-center justify-start w-full mb-3 gap-3">
		<div>
			<a href={`/posts/${item.id}`}>
				<h4
					class="w-fit my-3 text-center md:text-start hover:underline cursor-pointer underline-offset-4"
				>
					{item.title}
				</h4>
			</a>
			<div
				class="flex-wrap text-white text-opacity-50 flex gap-2 mb-3 items-center justify-center md:justify-start"
			>
				{#each item.topics as topicName}
					<a
						href={`/topics/${topicName}`}
						class="opacity-80 bg-orange whitespace-nowrap text-dark py-1 px-2 text-xs md:text-sm rounded-xl font-bold w-fit flex items-center justify-center gap-1 cursor-pointer hover:opacity-100 transition-all"
					>
						{topicName}
					</a>
				{/each}
			</div>

			<div
				class="flex items-center justify-center md:justify-start flex-row md:items-center text-center mb-1 gap-2"
			>
				<a href={`/users/${item.author.id}`}>
					<h6
						class="text-orange text-opacity-80 font-normal text-sm md:text-xl underline underline-offset-4"
					>
						{item.author.name}
					</h6>
				</a>
				<p
					class="flex items-center text-xs pt-1 md:pt-[3px] md:text-base md:ml-1 text-white text-opacity-40"
				>
					at {formatDate(item.created_at)}
				</p>
				<span class="flex items-center gap-1">
					<p
						class="text-xs text-white text-opacity-40 font-bold md:pt-1 md:ml-1 md:text-base"
					>
						Difficulty:
					</p>
					<p
						class="flex items-center text-xs text-white text-opacity-50 md:pt-1 md:text-base"
					>
						{item.difficulty !== null
							? capitalizeWord(item.difficulty)
							: 'Not Specified'}
					</p>
				</span>
			</div>

			<div class="flex items-center">
				{#if item.rates_count > 0}
					<!-- content here -->
					<div class="flex mt-1 justify-center md:justify-start w-full">
						<div class="flex">
							<span class="pb-1">
								<Icon name="Star" cl="text-white text-opacity-40" />
							</span>
							<p
								class="flex items-center text-white text-opacity-40 text-sm ml-1.5 mr-1.5"
							>
								{item.avg_rating}/5.0
							</p>
						</div>
						<p class="flex items-center text-white text-opacity-40 text-xs">
							(rated by {formatNumber(item.rates_count)} users)
						</p>
					</div>
				{/if}
			</div>
		</div>
		{#if item.description === null}
			<a
				href={`/posts/${item.id}`}
				class="cursor-pointer text-center w-32 static right-0 bottom-0 md:absolute bg-zinc-900  text-white font-bold py-4 px-6 rounded text-sm text-opacity-80 transition-all hover:scale-105"
			>
				Read Now
			</a>
		{/if}
	</div>
	{#if item.description !== null}
		<div class="text-white text-opacity-90 text-md md:text-lg mb-3">
			{item.description}
		</div>
		<div class="flex justify-center items-end mb-2 h-full">
			<a
				href={`/posts/${item.id}`}
				class="bg-zinc-900 text-white font-bold py-3 px-5 rounded text-xs h-10 transition-all hover:scale-105"
			>
				Read More
			</a>
		</div>
	{/if}
</div>
