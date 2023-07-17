<script lang="ts">
	import MarkdownTemplate from './_MarkdownTemplate.svelte';
	export let url: string | null = null;
	export let content: string | null = null;
</script>

<svelte:head>
	<script
		type="module"
		src="https://cdn.jsdelivr.net/gh/zerodevx/zero-md@2/dist/zero-md.min.js"
	></script>
</svelte:head>

<div class="w-full scrollbar-thumb-gray-300 scroll h-full bg-dark px-10 rounded-md opacity-90">
	{#if url}
		<zero-md src={url}>
			<MarkdownTemplate />
		</zero-md>
	{:else}
		<zero-md>
			{@html `<script type="text/markdown" data-dedent>${content}</script>`}
			<MarkdownTemplate />
		</zero-md>
	{/if}
</div>
