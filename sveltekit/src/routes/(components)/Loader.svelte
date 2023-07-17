<script lang="ts">
	import { onMount } from 'svelte';

	export let msg: string | null = null;
	export let cl: string = '';

	const ANIMATION_DELAY_MS = 200;

	let showAnimation = false;

	onMount(() => setTimeout(() => (showAnimation = true), ANIMATION_DELAY_MS));
</script>

{#if showAnimation}
	<div class={`flex flex-col justify-center items-center gap-3 ${cl}`}>
		<div
			class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-warning motion-reduce:animate-[spin_1.5s_linear_infinite]"
			role="status"
		>
			<span
				class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
			/>
		</div>
		{#if msg !== null}
			<span class="text-lg font-normal text-white text-opacity-70"> {msg} </span>
		{/if}
	</div>
{/if}
