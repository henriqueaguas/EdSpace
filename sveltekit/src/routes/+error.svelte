<!-- "Catch All" Custom Error Page  -->
<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<div class="flex flex-col justify-center items-center gap-3 mt-36">
	<div class="flex h-20 items-center justify-center gap-4">
		<h1 class="font-extrabold">{$page.status}</h1>
		{#if $page.error?.name}
			<div class="w-1 h-[65%] rounded-full bg-orange opacity-70" />
			<h2>{$page.error.name}</h2>
		{/if}
	</div>
	{#if $page.error && $page.error.message.length > 0}
		<p class="text-xl md:text-3xl mb-5">{$page.error?.message}</p>
	{/if}

	<button class="mbtn-invert" on:click={() => goto('../')}>Go Back</button>
</div>
