<script lang="ts">
	export let error: string | undefined;

	export let cl: string = '';
</script>

{#if error}
	<span class={`text-red-600 text-lg ${cl}`}>Error: {error}</span>
{/if}
