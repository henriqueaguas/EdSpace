<script lang="ts">
	import Icon from '../../../(assets)/Icon.svelte';
	import FileDropZone from '../../../(components)/FileDropZone.svelte';
	import { makeRequest } from '../../../(utils)/makeRequest';
	import { notify } from '../../../(utils)/notify';
	import { page } from '$app/stores';
	import UserImage from '../../../(components)/UserImage.svelte';
	import { LogicConstraints } from '$lib/services/constraints';
	import { invalidateAll } from '$app/navigation';

	export let onClose: () => void;

	const session = $page.data.session!;

	let newImageFile: File | undefined = undefined;
	let newUsername: string = session?.user.name;

	async function completeProcess() {
		const body = new FormData();

		body.set(
			'metadata',
			JSON.stringify(
				newUsername !== session.user.name
					? {
							name: newUsername
					  }
					: {}
			)
		);

		if (newImageFile) {
			body.set('file', newImageFile);
		}

		if (newImageFile || newUsername !== session.user.name) {
			const loadingNotification = notify.infiniteLoading('Updating profile information...');

			await makeRequest<string>(
				'/api/me',
				{
					method: 'PATCH',
					body
				},
				{
					onSuccess: () => {
						onClose();

						loadingNotification.remove();
						notify.success('Profile Information Updated!');

						// Force load function to refetch and update the displayed user information
						invalidateAll();
					},

					onError(e) {
						loadingNotification.remove();
						notify.error(e.message);

						// Reset fields
						newUsername = session.user.name;
						newImageFile = undefined;
					}
				}
			);
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	on:click={onClose}
	class="fixed flex items-start mt-24 gap-7 justify-center bg-opacity-50 top-0 left-0 h-screen w-screen bg-dark z-10"
>
	<div
		id="create-feed"
		class="flex flex-col items-center justify-start gap-5 py-10 max-w-[95vw] w-[1000px] text-orange overflow-y-scroll bg-darker rounded-xl border-2 border-black shadow-black shadow-lg"
		on:click|stopPropagation
		on:scroll|preventDefault
	>
		<div class={`flex gap-6 flex-col items-center max-w-[90%] ${''}`}>
			<div class="flex flex-col justify-center items-center gap-2">
				<h2>Edit your profile</h2>
			</div>

			<section class="flex flex-col gap-2 w-full">
				<span class="font-bold">Change Username</span>
				<input class="input-border" bind:value={newUsername} />
			</section>

			<section class="flex flex-col gap-2 w-full">
				<span class="font-bold">Change Image</span>
				<div class="flex w-full items-center justify-around gap-2">
					<div class="flex flex-col justify-start items-center gap-3">
						<UserImage
							imageLink={newImageFile
								? URL.createObjectURL(newImageFile)
								: session.user.image}
							size="big"
						/>

						{#if newImageFile}
							<span
								on:click={() => (newImageFile = undefined)}
								class="cursor-pointer"
							>
								<Icon name="Trash2" cl="text-red-600" />
							</span>
						{/if}
					</div>

					<FileDropZone
						bind:file={newImageFile}
						validFileExtensions={LogicConstraints.User.PROFILE_PICTURE
							.ALLOWED_PROFILE_PICTURE_FILE_EXTENSIONS_LIST}
						cl="max-h-[160px]"
					/>
				</div>
			</section>

			<button class="mbtn-invert" on:click={completeProcess}> Finish </button>
		</div>
	</div>
</div>
