<script lang="ts">
	export let curr: number;

	export let max: number;
	export let min: number = 1;

	export let cl: string = '';
</script>

<span
	class={'text-slate-300  opacity-40' +
		` ${curr >= min && curr <= max ? 'font-bold text-green-700 opacity-70' : ''} ${cl}`}
>
	{min} to {max} (current: {curr})
</span>
