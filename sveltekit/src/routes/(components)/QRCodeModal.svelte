<script lang="ts">
	import { onMount } from 'svelte';
	import qrcode from 'qrcode';
	import { notify } from '../(utils)/notify';

	export let link: string;
	export let onCloseModal: () => void = () => {};
	export let cl: string = '';

	let qrCodeElement: HTMLElement;

	onMount(() => {
		qrcode.toCanvas(qrCodeElement, link, (error) => {
			if (error) {
				notify.error('Could not generate QRCode', 'top-center');
				console.error(error);
			}
		});
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	on:click={onCloseModal}
	class="fixed flex items-center justify-center bg-opacity-90 top-0 left-0 h-screen w-screen bg-dark z-10"
>
	<div on:click|stopPropagation class={`${cl}`}>
		<slot name="before" />

		<canvas bind:this={qrCodeElement} />

		<slot name="after" />
	</div>
</div>
