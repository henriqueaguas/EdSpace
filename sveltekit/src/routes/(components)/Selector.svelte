<script lang="ts">
	export let options: { label: string; value: string | null }[];
	export let selectedOption: string | null;
	export let cl: string = ""
</script>

<select
	bind:value={selectedOption}
	class= {`select select-bordered border-orange bg-dark text-orange active:outline-none text-sm md:text-lg flex ${cl}` }
>
	{#each options as { label, value }}
		<option selected {value}>{label}</option>
	{/each}
</select>
