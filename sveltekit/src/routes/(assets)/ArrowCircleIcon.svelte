<script lang="ts">
	import Icon from './Icon.svelte';

	export let orientation: 'l' | 'r' | 't' | 'b';
	export let cl: string = '';

	const opts =
		'Arrow' +
		(orientation === 'l'
			? 'Left'
			: orientation === 't'
			? 'Up'
			: orientation === 'b'
			? 'Down'
			: 'Right') +
		'Circle';
</script>

<Icon name={opts} {cl} />
