<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AppLogo from './(assets)/AppLogo.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: session = data.session;

	onMount(() => {
		if (session !== null) {
			goto('/myfeeds');
		}
	});
</script>

<div class="flex flex-col items-center justify-center">
	<span class="flex items-center justify-center gap-4 md:gap-8">
		<AppLogo cl="scale-150 md:scale-[200%]" />
		<h1 class="font-extrabold">EdSpace</h1>
	</span>

	<h2 class="font-thin m-12">Welcome to EdSpace!</h2>

	<button
		on:click={() => goto(`/auth?csrf=true`, { state: { callback: '/myfeeds' } })}
		class="mbtn-invert-hover hover:border-orange px-10 py-4 text-2xl"
	>
		Sign In
	</button>
</div>
