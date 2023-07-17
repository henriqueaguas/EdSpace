<script lang="ts">
	import Icon from '../(assets)/Icon.svelte';
	import { notify } from '../(utils)/notify';

	export let file: File | undefined;
	export let validFileExtensions: string[];
	export let cl: string = '';

	// * Will always hold a single file since the file input does not have the "multiple" attribute
	let files: FileList;
	let fileInput: HTMLInputElement;

	$: {
		if (files) {
			if (validFileExtensions.some((validExt) => files[0].name.includes(validExt))) {
				file = files[0];
			} else {
				notify.error('Invalid file type');
				fileInput.value = '';
			}
		}
	}
</script>

<div
	class={`border-dashed border-2 rounded-md border-orange relative flex items-center justify-center flex-col py-8 w-full p-3 ${cl}`}
>
	<input
		bind:this={fileInput}
		bind:files
		type="file"
		accept={validFileExtensions.join(',')}
		class="absolute opacity-0 w-full h-full cursor-pointer"
	/>
	<Icon name="Upload" cl="scale-150 my-2 md:my-5 -z-10" />
	<h5 class="font-bold">Drop your file here or click to upload</h5>
	<p class="text-sm md:text-xl">
		({validFileExtensions.join(',')})
	</p>
</div>
