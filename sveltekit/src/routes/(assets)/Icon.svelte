<script lang="ts">
	// @ts-ignore
	import * as ic from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	export let name: string;
	export let cl = '';
	export let parentCl = '';

	const icons: any = ic;

	const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span on:click={() => dispatch('click')} class={parentCl}>
	<svelte:component this={icons[name]} class={cl} {...$$props} />
</span>
