<!-- ! NOTE: Component not being used currently -->
<script lang="ts">
	// A more intuitive way to create "flex" containers
	export let row: boolean = true;
	export let col: boolean = false;
	export let gap: string = '1';
	export let x: 'center' | 'start' | 'between' | 'around' | 'end' = 'start';
	export let y: 'center' | 'start' | 'between' | 'around' | 'end' = 'start';

	export let cl = '';

	let clazz = calcClass();

	function calcClass() {
		let finalClass = 'flex';

		if (col) {
			row = false;
			finalClass += ' flex-col';
		}
		if (row) {
			finalClass += ' flex-row';
		}
		finalClass += ` gap-${gap}`;

		if (row) {
			finalClass += ` justify-${x}`;
			finalClass += ` items-${y}`;
		}
		if (col) {
			finalClass += ` items-${x}`;
			finalClass += ` justify-${y}`;
		}

		return finalClass;
	}
</script>

<div class={clazz + ' ' + cl}>
	<slot />
</div>
