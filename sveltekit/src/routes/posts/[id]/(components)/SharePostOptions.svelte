<script lang="ts">
	import QRCodeModal from './../../../(components)/QRCodeModal.svelte';
	import { page } from '$app/stores';
	import { notify } from '../../../(utils)/notify';
	import { onMount } from 'svelte';
	import { onClickedOutside } from '../../../(utils)/onClickedOutside';
	import Icon from '../../../(assets)/Icon.svelte';

	export let postTitle: string;
	export let postAuthorName: string;
	export let onClose: () => void;

	let hasCopiedPostLink = false;
	let showQrCodeModal = false;

	$: {
		if (hasCopiedPostLink) {
			navigator.clipboard.writeText($page.url.toString());
			notify.info('Post link copied to clipboard', 'top-center');
			setTimeout(() => (hasCopiedPostLink = false), 5000);
		}
	}

	let elem: HTMLElement;

	onMount(() => {
		const removeEvent = onClickedOutside(elem, onClose);

		return () => {
			removeEvent();
		};
	});
</script>

<ul
	bind:this={elem}
	id="share-post-options"
	class="absolute -left-16 md:-top-[190%] -top-[370%] border-2 bg-dark text-opacity-60  border-orange border-opacity-40 rounded-md font-bold p-3 flex flex-col items-center justify-center gap-2 w-36"
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<li
		on:click={() => (hasCopiedPostLink = true)}
		class="flex gap-1 cursor-pointer transition-all hover:scale-105 "
	>
		{#if hasCopiedPostLink}
			<Icon name="CopyCheck" cl="scale-[85%]" />
		{:else}
			<Icon name="Copy" cl="scale-75" />
		{/if}
		<span>Copy Link</span>
	</li>

	<hr class="border-orange rounded-full w-[80%]" />

	{#if showQrCodeModal}
		<!-- svelte-ignore missing-declaration -->
		<QRCodeModal
			onCloseModal={() => (showQrCodeModal = false)}
			link={$page.url.toString()}
			cl="flex flex-col items-center justify-center bg-darker p-14 gap-5 shadow-md shadow-black max-w-[700px] w-[80vw]"
		>
			<span slot="before" class="flex flex-col items-center gap-1">
				<h4>{postTitle}</h4>
				<span class="font-normal text-xl">
					by
					<span class="italic text-2xl">
						{postAuthorName}
					</span>
				</span>
			</span>
		</QRCodeModal>
	{/if}

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<li
		on:click={() => (showQrCodeModal = true)}
		class="flex gap-1 cursor-pointer transition-all hover:scale-105 "
	>
		<Icon name="QrCode" cl="scale-75" />
		<span>QR Code</span>
	</li>
</ul>
