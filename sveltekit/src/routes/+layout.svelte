<!-- App Top Level. It will allways be present -->
<script lang="ts">
	import Icon from './(assets)/Icon.svelte';
	import NavBar from './(components)/(navbar)/NavBar.svelte';
	import '../app.css';
	import { Toaster } from 'svelte-french-toast';
	import type { LayoutServerData } from './$types';
	import { page } from '$app/stores';

	export let data: LayoutServerData;

	const session = data.session;

	$: route = $page.route.id as string;

	const routesWithoutNavBar = ['/auth', '/posts/new'];
	const routesWithoutCreatePostIcon = ['exact:/', '/auth', '/search', '/users', '/posts'];
</script>

<svelte:head>
	<title>EdSpace</title>
</svelte:head>

<div class="app flex flex-col items-center justify-start gap-4 overflow-x-hidden pb-6">
	{#if !routesWithoutNavBar.includes(route)}
		<NavBar me={session?.user} />
	{/if}
	<Toaster />
	<slot />

	{#if route && !routesWithoutCreatePostIcon
			.filter((i) => i.startsWith('exact:'))
			.some((r) => r === `exact:${route}`) && !routesWithoutCreatePostIcon
			.filter((i) => !i.startsWith('exact:'))
			.some((r) => route.includes(r))}
		<a
			href="/posts/new"
			class="fixed md:bottom-5 bottom-2 md:right-5 right-2 flex flex-col gap-1 justify-center items-center opacity-70"
		>
			<Icon
				name="Pencil"
				parentCl="whitespace-nowrap rounded-full p-2 md:p-4 text-dark bg-orange transition-all cursor-pointer scale-[90%] hover:scale-[95%]"
			/>
			<span class="font-bold text-base hidden md:block"> Create a post </span>
		</a>
	{/if}
</div>
